import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { isUserSignedIn } from 'blockstack';
import { ipcRenderer } from 'electron';
import isElectron from 'is-electron';

import PictureService from '../services/PictureService.js';
import PresentingService from '../services/PresentingService.js';
import BlockImg from '../components/BlockImg.js';

export default class PicturesList extends Component {

  static propTypes = {
    history: PropTypes.any,
    match: PropTypes.any
  };

  state = {
    nextAndPreviousPicture: [],
    currentId: this.props.match.params.id
  };

  constructor(props) {
    super(props);

    this.pictureService = new PictureService();
    this.present = new PresentingService();

    const { history } = this.props;
    // Go to signin page if no active session exist
    if (!isUserSignedIn()) {
      if (history) {
        history.replace('/');
      }
      return;
    }

    const { match } = this.props;

    // Go to pictures list if picture id is missing
    if (!match || !match.params || !match.params.id) {
      if (history) {
        history.replace('/pictures');
      }
      return;
    }

  }

  componentDidMount() {
    if (isElectron()) {
      ipcRenderer.on('upload-files', this.uploadFiles.bind(this));
    }

    this.loadPictureWithId(this.props.match.params.id);
  }

  componentWillUnmount() {
    if (isElectron()) {
      ipcRenderer.removeAllListeners('upload-files');
    }
  }

  async loadPictureWithId(id) {
    if (id) {
      const nextAndPreviousPicture = await this.pictureService.getNextAndPreviousPicture(id);
      this.setState({ nextAndPreviousPicture: nextAndPreviousPicture, currentId: id });
    }
  }

  async deletePicture() {
    const actionSheetController = document.querySelector('ion-action-sheet-controller');
    await actionSheetController.componentOnReady();

    const actionSheet = await actionSheetController.create({
      header: "Delete picture?",
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: async () => {
          this.present.loading('Deleting picture...');
          let result = await this.pictureService.deletePicture(this.state.currentId);
          this.present.dismissLoading();
          if (result === true) {
            const { history } = this.props;
            history.replace('/pictures');
          } else {
            this.presentDeleteError();
          }
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel'
      }]
    });
    await actionSheet.present();

  }

  async presentDeleteError() {
    const alertController = document.querySelector('ion-alert-controller');
    await alertController.componentOnReady();

    const alert = await alertController.create({
      header: 'Removal failed',
      subHeader: '',
      message: 'The removal of the picture failed. Please try again in a few minutes!',
      buttons: ['OK']
    });
    return await alert.present();
  }

  async uploadFiles(event, filesData) {
    if (filesData && filesData.length > 0) {
      this.present.loading('Pictures uploading...');
      const response = await this.pictureService.uploadPictures(filesData);
      this.present.dismissLoading();
      if (response.errorsList && response.errorsList.length > 0) {
        for (let error of response.errorsList) {
          if (error.errorCode === 'err_filesize') {
            this.present.toast('Failed to upload "' + error.id + '", picture exceeds file size limit of 5MB.');
          } else {
            this.present.toast('Failed to upload "' + error.id + '".');
          }
        }
      }
    }
  }

  render() {
    const { currentId, nextAndPreviousPicture } = this.state;
    if (!currentId) {
      return (<h1>404 - Picture not found</h1>);
    }
    return (
      <React.Fragment>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <Link to="/pictures">
                <ion-button>
                  <ion-icon name="close"></ion-icon>
                </ion-button>
              </Link>
            </ion-buttons>
            <ion-title>Block Photo</ion-title>
            <ion-buttons slot="end">
              <ion-button onClick={() => this.deletePicture()}>
                <ion-icon name="trash"></ion-icon>
              </ion-button>
              <ion-button disabled={!nextAndPreviousPicture.previousId} onClick={() => this.loadPictureWithId(nextAndPreviousPicture.previousId)}>
                <ion-icon name="arrow-back"></ion-icon>
              </ion-button>
              <ion-button disabled={!nextAndPreviousPicture.nextId} onClick={() => this.loadPictureWithId(nextAndPreviousPicture.nextId)}>
                <ion-icon name="arrow-forward"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content text-center class="picture-background">
          <BlockImg id={currentId} />
        </ion-content>
        <ion-alert-controller />
        <ion-action-sheet-controller />
      </React.Fragment>
    );
  }

}
