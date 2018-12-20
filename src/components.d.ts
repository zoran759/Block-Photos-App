/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';

import '@ionic/core';
import 'ionicons';


export namespace Components {

  interface BlockImg {
    'photoId': string;
    'refresh': boolean;
    'rotate': boolean;
  }
  interface BlockImgAttributes extends StencilHTMLAttributes {
    'photoId'?: string;
    'refresh'?: boolean;
    'rotate'?: boolean;
  }

  interface AppAlbums {}
  interface AppAlbumsAttributes extends StencilHTMLAttributes {}

  interface AppPhoto {
    'photoId': string;
    'updateCallback': any;
  }
  interface AppPhotoAttributes extends StencilHTMLAttributes {
    'photoId'?: string;
    'updateCallback'?: any;
  }

  interface AppPhotos {
    'photoId': string;
  }
  interface AppPhotosAttributes extends StencilHTMLAttributes {
    'photoId'?: string;
  }

  interface AppProfile {}
  interface AppProfileAttributes extends StencilHTMLAttributes {}

  interface AppRoot {}
  interface AppRootAttributes extends StencilHTMLAttributes {}

  interface AppSignin {}
  interface AppSigninAttributes extends StencilHTMLAttributes {}
}

declare global {
  interface StencilElementInterfaces {
    'BlockImg': Components.BlockImg;
    'AppAlbums': Components.AppAlbums;
    'AppPhoto': Components.AppPhoto;
    'AppPhotos': Components.AppPhotos;
    'AppProfile': Components.AppProfile;
    'AppRoot': Components.AppRoot;
    'AppSignin': Components.AppSignin;
  }

  interface StencilIntrinsicElements {
    'block-img': Components.BlockImgAttributes;
    'app-albums': Components.AppAlbumsAttributes;
    'app-photo': Components.AppPhotoAttributes;
    'app-photos': Components.AppPhotosAttributes;
    'app-profile': Components.AppProfileAttributes;
    'app-root': Components.AppRootAttributes;
    'app-signin': Components.AppSigninAttributes;
  }


  interface HTMLBlockImgElement extends Components.BlockImg, HTMLStencilElement {}
  var HTMLBlockImgElement: {
    prototype: HTMLBlockImgElement;
    new (): HTMLBlockImgElement;
  };

  interface HTMLAppAlbumsElement extends Components.AppAlbums, HTMLStencilElement {}
  var HTMLAppAlbumsElement: {
    prototype: HTMLAppAlbumsElement;
    new (): HTMLAppAlbumsElement;
  };

  interface HTMLAppPhotoElement extends Components.AppPhoto, HTMLStencilElement {}
  var HTMLAppPhotoElement: {
    prototype: HTMLAppPhotoElement;
    new (): HTMLAppPhotoElement;
  };

  interface HTMLAppPhotosElement extends Components.AppPhotos, HTMLStencilElement {}
  var HTMLAppPhotosElement: {
    prototype: HTMLAppPhotosElement;
    new (): HTMLAppPhotosElement;
  };

  interface HTMLAppProfileElement extends Components.AppProfile, HTMLStencilElement {}
  var HTMLAppProfileElement: {
    prototype: HTMLAppProfileElement;
    new (): HTMLAppProfileElement;
  };

  interface HTMLAppRootElement extends Components.AppRoot, HTMLStencilElement {}
  var HTMLAppRootElement: {
    prototype: HTMLAppRootElement;
    new (): HTMLAppRootElement;
  };

  interface HTMLAppSigninElement extends Components.AppSignin, HTMLStencilElement {}
  var HTMLAppSigninElement: {
    prototype: HTMLAppSigninElement;
    new (): HTMLAppSigninElement;
  };

  interface HTMLElementTagNameMap {
    'block-img': HTMLBlockImgElement
    'app-albums': HTMLAppAlbumsElement
    'app-photo': HTMLAppPhotoElement
    'app-photos': HTMLAppPhotosElement
    'app-profile': HTMLAppProfileElement
    'app-root': HTMLAppRootElement
    'app-signin': HTMLAppSigninElement
  }

  interface ElementTagNameMap {
    'block-img': HTMLBlockImgElement;
    'app-albums': HTMLAppAlbumsElement;
    'app-photo': HTMLAppPhotoElement;
    'app-photos': HTMLAppPhotosElement;
    'app-profile': HTMLAppProfileElement;
    'app-root': HTMLAppRootElement;
    'app-signin': HTMLAppSigninElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
