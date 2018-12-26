import CacheService from './cache-service';
import uuidv4 from 'uuid/v4';
import LargeStorageService from './large-storage-service';
import AlbumsService from './albums-service';

declare var blockstack;

export default class PhotosService {
  private cache: CacheService;
  private photoStorage: LargeStorageService;

  constructor() {
    this.cache = new CacheService();
    this.photoStorage = new LargeStorageService();
  }

  async getPhotosList(sync?: boolean, albumId?: string): Promise<any> {
    let cachedPhotosList = [];
    const errorsList = [];
    try {
      const rawCachedPhotosList = albumId
        ? await this.cache.getItem(albumId)
        : await this.cache.getItem('picture-list.json');

      if (rawCachedPhotosList) {
        cachedPhotosList = JSON.parse(rawCachedPhotosList);
      }
    } catch (error) {
      errorsList.push('err_cache');
    }

    if (sync || !cachedPhotosList || cachedPhotosList.length === 0) {
      try {
        // Get the contents of the file picture-list.json
        const rawPhotosList = albumId
          ? await blockstack.getFile(albumId)
          : await blockstack.getFile('picture-list.json');
        if (rawPhotosList) {
          const photosList = JSON.parse(rawPhotosList);
          cachedPhotosList = photosList;
          if (albumId) {
            await this.cache.setItem(albumId, rawPhotosList);
          } else {
            await this.cache.setItem('picture-list.json', rawPhotosList);
          }
        }
      } catch (error) {
        errorsList.push('err_list');
      }
    }

    return {
      photosList: cachedPhotosList,
      errorsList
    };
  }

  async loadPhoto(id: string): Promise<any> {
    let cachedPhoto = await this.cache.getItem(id);

    if (!cachedPhoto) {
      cachedPhoto = await this.photoStorage.readFile(id);
      this.cache.setItem(id, cachedPhoto);
    }

    if (cachedPhoto && !cachedPhoto.match('data:image/.*')) {
      cachedPhoto = 'data:image/png;base64,' + cachedPhoto;
    }
    return cachedPhoto;
  }

  async uploadPhoto(file: any, event: any, albumId?: string): Promise<any> {
    const photosListResponse = await this.getPhotosList(true);
    let photosList = photosListResponse.photosList;
    if (
      (!photosList || photosList == null) &&
      photosListResponse.errorsList.length === 0
    ) {
      photosList = [];
    }

    let album = [];
    if (albumId) {
      const albumsResponse = await this.getPhotosList(true, albumId);
      album = albumsResponse.photosList;
      if ((!album || album == null) && albumsResponse.errorsList.length === 0) {
        album = [];
      }
    }

    const errorsList = [];
    const photoId = uuidv4() + file.filename.replace('.', '');
    const listdata = {
      id: photoId,
      filename: file.filename
    };
    const metadata = {
      id: photoId,
      filename: file.filename,
      uploadedDate: new Date(),
      stats: file.stats,
      albums: [albumId]
    };
    try {
      // Save raw data to a file
      await this.photoStorage.writeFile(photoId, event.target.result);
      await this.cache.setItem(photoId, event.target.result);

      // Save photos metadata to a file
      await this.photoStorage.writeFile(
        photoId + '-meta',
        JSON.stringify(metadata)
      );
      await this.cache.setItem(photoId + '-meta', JSON.stringify(metadata));

      photosList.unshift(listdata);
      if (albumId) {
        const albumsService = new AlbumsService();
        await albumsService.updateAlbumThumbnail(albumId, photoId);

        album.unshift(listdata);
      }
    } catch (error) {
      const fileSizeInMegabytes = file.stats.size / 1000000;
      if (fileSizeInMegabytes >= 5) {
        errorsList.push({
          id: file.filename,
          errorCode: 'err_filesize'
        });
      } else {
        errorsList.push({
          id: file.filename,
          errorCode: 'err_failed'
        });
      }
    }

    await this.cache.setItem('picture-list.json', JSON.stringify(photosList));
    await blockstack.putFile('picture-list.json', JSON.stringify(photosList));

    if (albumId) {
      await this.cache.setItem(albumId, JSON.stringify(album));
      await blockstack.putFile(albumId, JSON.stringify(album));
    }

    return { photosList, errorsList };
  }

  async deletePhoto(photoId: string): Promise<boolean> {
    let returnState = false;
    const metadata = await this.getPhotoMetaData(photoId);
    try {
      // Put empty file, since deleteFile is yet not supported
      await this.photoStorage.writeFile(photoId, 'deleted');
      await this.photoStorage.writeFile(photoId + '-meta', 'deleted');
      // TODO: add back when available.
      // await deleteFile(photoId);
      returnState = true;
    } catch (error) {
      returnState = false;
    }

    if (!returnState) {
      return false;
    }

    // Remove photo from main list
    returnState = await this.removePhotoFromList(photoId);

    // Remove photo from albums
    if (metadata.albums && metadata.albums.length > 0) {
      for (const albumId of metadata.albums) {
        returnState = await this.removePhotoFromList(photoId, albumId);
        if (!returnState) {
          return false;
        }
      }
    }
    return returnState;
  }

  async removePhotoFromList(
    photoId: string,
    albumId?: string
  ): Promise<boolean> {
    const photosListResponse = await this.getPhotosList(true, albumId);
    const photosList = photosListResponse.photosList;
    const listName = albumId ? albumId : 'picture-list.json';

    let index = 0;
    for (const photo of photosList) {
      if (photoId === photo.id) {
        photosList.splice(index, 1);
        await this.cache.setItem(listName, JSON.stringify(photosList));
        await blockstack.putFile(listName, JSON.stringify(photosList));
        break;
      }
      index++;
    }

    const metadata = await this.getPhotoMetaData(photoId);
    if (metadata && metadata !== 'deleted') {
      metadata.albums = metadata.albums.includes(albumId)
        ? metadata.albums.filter(album => album !== albumId)
        : metadata.albums;
      await this.setPhotoMetaData(photoId, metadata);
    }

    return true;
  }

  async deletePhotos(photoIds: string[]): Promise<boolean> {
    let returnState = false;
    try {
      for (const photoId of photoIds) {
        const result = await this.deletePhoto(photoId);
        if (!result) {
          throw result;
        }
      }
      returnState = true;
    } catch (error) {
      returnState = false;
    }

    return returnState;
  }

  async removePhotosFromList(
    photoIds: string[],
    albumId?: string
  ): Promise<boolean> {
    let returnState = false;
    try {
      for (const photoId of photoIds) {
        const result = await this.removePhotoFromList(photoId, albumId);
        if (!result) {
          throw result;
        }
      }
      returnState = true;
    } catch (error) {
      returnState = false;
    }

    return returnState;
  }

  async getNextAndPreviousPhoto(id: string, albumId?: string): Promise<any> {
    const response = { previousId: null, nextId: null };
    const photosListResponse = await this.getPhotosList(true, albumId);
    const photosList = photosListResponse.photosList;

    let index = 0;
    for (const photo of photosList) {
      // Current photo
      if (photo.id === id) {
        if (photosList[index - 1]) {
          response.previousId = photosList[index - 1].id;
        }
        if (photosList[index + 1]) {
          response.nextId = photosList[index + 1].id;
        }
        break;
      }
      index++;
    }

    return response;
  }

  async getPhotoMetaData(photoId: string): Promise<any> {
    let cachedPhotoMetaData = await this.cache.getItem(photoId + '-meta');

    if (!cachedPhotoMetaData) {
      cachedPhotoMetaData = await blockstack.getFile(photoId + '-meta');
      this.cache.setItem(photoId + '-meta', cachedPhotoMetaData);
    }

    if (!cachedPhotoMetaData) {
      const photosListResponse = await this.getPhotosList();
      const photosList = photosListResponse.photosList;

      let index = 0;
      for (const photo of photosList) {
        // Current photo
        if (photo.id === photoId) {
          cachedPhotoMetaData = photosList[index];
          this.setPhotoMetaData(photoId, cachedPhotoMetaData);
          break;
        }
        index++;
      }
      return cachedPhotoMetaData;
    } else {
      return JSON.parse(cachedPhotoMetaData);
    }
  }

  async setPhotoMetaData(photoId: string, metadata: any): Promise<boolean> {
    // id and metadata is required
    if (!photoId || !metadata) {
      return false;
    }

    // Save photos metadata to a file
    await blockstack.putFile(photoId + '-meta', JSON.stringify(metadata));
    await this.cache.setItem(photoId + '-meta', JSON.stringify(metadata));

    return true;
  }

  async rotatePhoto(photoId: string): Promise<any> {
    const metadata = await this.getPhotoMetaData(photoId);

    let currentOrientation = 1;

    if (
      metadata &&
      metadata.stats &&
      metadata.stats.exifdata &&
      metadata.stats.exifdata.tags.Orientation
    ) {
      currentOrientation = metadata.stats.exifdata.tags.Orientation;
    }

    if (!metadata.stats) {
      metadata.stats = { exifdata: { tags: {} } };
    }

    if (!metadata.stats.exifdata) {
      metadata.stats.exifdata = { tags: {} };
    }

    if (!metadata.stats.exifdata.tags) {
      metadata.stats.exifdata.tags = {};
    }

    if (currentOrientation === 1) {
      metadata.stats.exifdata.tags.Orientation = 6;
    } else if (currentOrientation === 6) {
      metadata.stats.exifdata.tags.Orientation = 3;
    } else if (currentOrientation === 3) {
      metadata.stats.exifdata.tags.Orientation = 8;
    } else {
      metadata.stats.exifdata.tags.Orientation = 1;
    }

    return this.setPhotoMetaData(photoId, metadata);
  }
}
