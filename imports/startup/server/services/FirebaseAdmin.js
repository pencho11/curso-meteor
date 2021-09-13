import firebaseAdmin from 'firebase-admin';
import serviceAccount from '../../../../settings/meteor-vue-fb643-firebase-adminsdk-50cu3-4c287411da.json';

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    storageBucket: 'meteor-vue-fb643.appspot.com'
});

export const firebaseAdminStorage = firebaseAdmin.storage().bucket();

export const BASE_URL_STORAGE = 'https://storage.googleapis.com';