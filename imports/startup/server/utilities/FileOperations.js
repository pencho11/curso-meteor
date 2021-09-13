import { ResponseMessage } from "./ResponseMessage";
import mimetypes from 'mimetypes';
import Utilities from "./Utilities";
import { BASE_URL_STORAGE, firebaseAdminStorage } from "../services/FirebaseAdmin";

export default {
    async saveFileFromBufferToGoogleStorage (fileBuffer, name, path, mimeType){
        const responseMessage = new ResponseMessage();
        const filename = `${name}${Utilities.generateNumberToken(10, 99)}.${mimetypes.detectExtension(mimeType)}`;
        const file = firebaseAdminStorage.file(`${path}/${filename}`);
        const fileUrl = `${BASE_URL_STORAGE}/${firebaseAdminStorage.name}/${path}/${filename}`;
        
        try {
            await file.save(fileBuffer, {
                metadata: {
                    contentType: mimeType
                },
                public: true
            });
            responseMessage.create('File uploaded', null, {success: true, fileUrl});
        } catch (error) {
            console.error('Error uploading file to Google Storage');
            responseMessage.create('Error uploading file to Google Storage', null, {success: false});
        }
        return responseMessage;
    },
    async saveFileFromBase64ToGoogleStorage(base64file, name, path){
        const mimeType = base64file.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
        const base64EncodedImageString = base64file.split(';base64,').pop();
        const fileBuffer = Buffer.from(base64EncodedImageString, 'base64');
        return await this.saveFileFromBufferToGoogleStorage(fileBuffer, name, path, mimeType);
    },
    async deleteFileFromGoogleStorageIfExists(fileLocation) {
        const file = firebaseAdminStorage.file(fileLocation);
        
        try {
            const existsFile = await file.exists();
            if (existsFile[0]) {
                await file.delete();
            }
        } catch (error) {
            console.error('Error delete file from Google Storage', error);    
        }
    },
    async deleteFilesOfFolderFromGoogleStorage (userFolder) {
        try {
            await firebaseAdminStorage.deleteFiles({prefix: userFolder + '/'})
        } catch (error) {
            console.error('Error deleting files from Google Storage: ', error);
        }
    }
};