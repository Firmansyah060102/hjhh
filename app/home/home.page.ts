import { Component } from '@angular/core';
import { NavController, ToastController, ActionSheetController,LoadingController } from 'ionic-angular';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { File,FileEntry } from '@ionic-native/file';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  imageURI:any;
  imageFileName:any;
  GetImageNameUpload:any;
  constructor(public navCtrl: NavController, 
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController, 
    private transfer: FileTransfer,
    private camera: Camera,
    private filePath: FilePath,
    private file: File,
    public loadingCtrl: LoadingController) {
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Pilih sumber gambar',
      buttons: [
        {
          text: 'Ambil foto',
          handler: () => {
            this.getImage(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Ambil dari galeri',
          handler: () => {
            this.getImage(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },        
        {
          text: 'Batal',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  getImage(sourceType) {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    loader.present();
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: sourceType
    }  
    this.camera.getPicture(options).then((imagePath) => {
      this.imageURI = imagePath;      
      this.filePath.resolveNativePath(imagePath)
        .then(filePath => {
          this.file.resolveLocalFilesystemUrl(filePath).then(fileInfo =>
            {
              let files = fileInfo as FileEntry;
              files.file(success =>
                {                  
                  this.imageFileName=success.name;
                });
            },err =>
            {
              console.log(err);
              throw err;              
            });
        });
        loader.dismiss();
    }, (err) => {
      console.log(err);
      this.presentToast(err);
      loader.dismiss();
    });    
  }

  uploadFile() {
    let loader = this.loadingCtrl.create({
      content: "Uploading..."
    });
    loader.present();
    const fileTransfer: FileTransferObject = this.transfer.create();  

    let URL="http://10.0.2.2/blog/upload-image-ionic/upload.php";
    
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: this.imageFileName,
      chunkedMode: false,
      mimeType: "image/jpeg",
      headers: {}
    }  
    fileTransfer.upload(this.imageURI, URL, options)
      .then((data) => {
      this.GetImageNameUpload=this.imageFileName;
      loader.dismiss();
      this.presentToast("Image uploaded successfully");
    }, (err) => {
      console.log(err);
      loader.dismiss();
      this.presentToast(err);
    });
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });  
    toast.present();
  }
}