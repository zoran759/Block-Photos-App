import * as blockstack from 'blockstack';
import PictureService from './PictureService';
import CacheService from './CacheService';

jest.mock('blockstack');
jest.mock('./CacheService');

describe('PictureService Test Suites', () => {

  const mockPictureListResponse = [
    {
      "id": 'test1.jpg',
      "uploadedDate": "2018-07-11T21:58:39.754Z"
    },
    {
      "id": 'test2.jpg',
      "uploadedDate": "2018-07-11T21:58:39.754Z"
    },
    {
      "id": 'test3.jpg',
      "uploadedDate": "2018-07-11T21:58:39.754Z"
    }
  ];

  beforeEach(() => {
    CacheService.mockClear();
    CacheService.mockImplementation(() => {
      return {
        getItem: jest.fn(),
        setItem: jest.fn()
      };
    });
  });

  it('initialize without crashing', () => {
    new CacheService();
    new PictureService();
  });

  it('get pictures list', async () => {
    const mockResponse = [{
      "id": 'test123.jpg',
      "uploadedDate": "2018-07-11T21:58:39.754Z"
    }];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getPicturesList();
    const pictures = response.picturesList;
    expect(Array.isArray(pictures)).toBe(true);
    expect(pictures).toEqual(mockResponse);

  });

  it('get empty pictures list', async () => {
    const mockResponse = [];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getPicturesList();
    const pictures = response.picturesList;
    expect(Array.isArray(pictures)).toBe(true);
    expect(pictures).toEqual(mockResponse);

  });

  it('get pictures list cache error', async () => {

    const mockResponse = [];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getPicturesList();
    const pictures = response.picturesList;
    expect(Array.isArray(pictures)).toBe(true);
    expect(pictures).toEqual(mockResponse);
    expect(response.errorsList[0]).toEqual(['err_cache']);

  });

  it('get pictures list error', async () => {

    blockstack.getFile.mockReturnValue(Promise.reject('failed!'));

    const pictureService = new PictureService();
    const response = await pictureService.getPicturesList();

    const pictures = response.picturesList;
    expect(Array.isArray(pictures)).toBe(true);
    expect(response.errorsList[0]).toEqual(["err_cache", "err_list"]);

  });

  it('upload picture', async () => {
    const pictureService = new PictureService();
    const response = await pictureService.uploadPictures([{
      filename: 'test1.png',
      data: 'trash'
    }]);

    const pictures = response.picturesList;
    const parsedUploadedDate = new Date(Date.parse(pictures[0].uploadedDate));
    expect(parsedUploadedDate.getFullYear()).toEqual(new Date().getFullYear());
    expect(parsedUploadedDate.getMonth()).toEqual(new Date().getMonth());
    expect(parsedUploadedDate.getDate()).toEqual(new Date().getDate());
    expect(parsedUploadedDate.getHours()).toEqual(new Date().getHours());
    expect(parsedUploadedDate.getMinutes()).toEqual(new Date().getMinutes());
    expect(pictures.length).toBeGreaterThanOrEqual(1);
    expect(pictures[0].id).toContain('test1.png');

  });

  it('upload picture error', async () => {

    blockstack.putFile.mockReturnValueOnce(Promise.reject('failed!'));

    const pictureService = new PictureService();
    const response = await pictureService.uploadPictures([{
      filename: 'test1.png',
      data: 'trash',
      stats: { size: 100 }
    }]);

    expect(response.picturesList).toEqual([]);
    expect(response.errorsList[0].id).toEqual('test1.png');
    expect(response.errorsList[0].errorCode).toEqual('err_failed');

  });

  it('upload picture filesize error', async () => {

    blockstack.putFile.mockReturnValueOnce(Promise.reject('failed!'));

    const pictureService = new PictureService();
    const response = await pictureService.uploadPictures([{
      filename: 'test2.png',
      data: 'trash',
      stats: { size: 6000000 }
    }]);

    expect(response.picturesList).toEqual([]);
    expect(response.errorsList[0].id).toEqual('test2.png');
    expect(response.errorsList[0].errorCode).toEqual('err_filesize');

  });

  it('load a picture', () => {
    const mockResponse = 'base64mumbojumbo';
    blockstack.getFile.mockReturnValue(Promise.resolve(mockResponse));

    const pictureService = new PictureService();
    pictureService.loadPicture('fakeid.jpg').then((picture) => {
      expect(picture).toEqual(mockResponse);
    });
  });

  it('delete existing picture', () => {
    const mockResponse = [
      {
        "id": 'test123.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      },
      {
        "id": 'fakeid.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      }
    ];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    pictureService.deletePicture('fakeid.jpg').then((result) => {
      expect(result).toBe(true);
    });
  });

  it('delete nonexistent picture', () => {
    const mockResponse = [
      {
        "id": 'test123.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      },
      {
        "id": 'fakeid.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      }
    ];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    pictureService.deletePicture('fakeid-gone.jpg').then((result) => {
      expect(result).toBe(false);
    });
  });

  it('get next and previous image', async () => {

    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockPictureListResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture('test2.jpg');

    expect(response.previousId).toEqual('test1.jpg');
    expect(response.nextId).toEqual('test3.jpg');

  });

  it('get next image with previous image as null', async () => {
    
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockPictureListResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture('test1.jpg');

    expect(response.previousId).toEqual(null);
    expect(response.nextId).toEqual('test2.jpg');

  });

  it('get previous image with next image as null', async () => {

    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockPictureListResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture('test3.jpg');

    expect(response.previousId).toEqual('test2.jpg');
    expect(response.nextId).toEqual(null);

  });

  it('get no previous image and no next image', async () => {
    const mockResponse = [
      {
        "id": 'test1.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      }
    ];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture('test1.jpg');

    expect(response.previousId).toEqual(null);
    expect(response.nextId).toEqual(null);

  });

  it('get no previous image and no next image on wrong id', async () => {
    const mockResponse = [
      {
        "id": 'test1.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      }
    ];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture('test2.jpg');

    expect(response.previousId).toEqual(null);
    expect(response.nextId).toEqual(null);

  });

  it('get no previous image and no next image on empty id', async () => {
    const mockResponse = [
      {
        "id": 'test1.jpg',
        "uploadedDate": "2018-07-11T21:58:39.754Z"
      }
    ];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture();

    expect(response.previousId).toEqual(null);
    expect(response.nextId).toEqual(null);

  });

  it('get no previous image and no next image on empty list', async () => {
    const mockResponse = [];
    blockstack.getFile.mockReturnValue(Promise.resolve(JSON.stringify(mockResponse)));

    const pictureService = new PictureService();
    const response = await pictureService.getNextAndPreviousPicture('dummy');

    expect(response.previousId).toEqual(null);
    expect(response.nextId).toEqual(null);

  });
});
