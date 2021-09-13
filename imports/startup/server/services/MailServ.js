if (Meteor.isDevelopment) {
    if (Meteor.settings.private?.SENDER_EMAILS) {
        process.env.EMAIL_SERVICES = Meteor.settings.private.SENDER_EMAILS.SERVICES;
        } else {
        console.warn('[Meteor + Vue] - Sender emails are not configured, Emails will not be send');
    }
}

const name = 'Scaffold Metor + Vue';
const email = `<${process.env.EMAIL_SERVICES}>`;
const from = `${name} ${email}`;

Accounts.emailTemplates.siteName = name;
Accounts.emailTemplates.from = from;
const emailTemplates = Accounts.emailTemplates;

const emailEnrollAccount = 'email_enroll_account.html';
const emailResetPassword = 'email_reset_password.html';
const emailVerifyEmail = 'email_verify_email.html';

const productSrc = 'https://firebasestorage.googleapis.com/v0/b/meteor-vue-fb643.appspot.com/o/vue-meteor.png?alt=media'
const logoSrc = 'https://firebasestorage.googleapis.com/v0/b/meteor-vue-fb643.appspot.com/o/PoweredDark.png?alt=media'

emailTemplates.enrollAccount = {
    subject() {
        return `Bienvenido a ${name}`;
    },
    html (user, url) {
        const urlWithoutHash = url.replace('#/', '');
        if (Meteor.isDevelopment) console.info('Set initial password link: ', urlWithoutHash);
        SSR.compileTemplate('emailEnrollAccount', Assets.getText(emailEnrollAccount));
        return SSR.render('emailEnrollAccount', {
            urlWithoutHash,
            productSrc,
            logoSrc
        });
    }
};

emailTemplates.resetPassword = {
    subject() {
        return `Restablece tu contraseña`;
    },
    html (user, url) {
        const urlWithoutHash = url.replace('#/', '');
        if (Meteor.isDevelopment) console.info('Password reset link: ', urlWithoutHash);
        SSR.compileTemplate('emailResetPassword', Assets.getText(emailResetPassword));
        return SSR.render('emailResetPassword', {
            urlWithoutHash,
            productSrc,
            logoSrc
        });
    }
};

emailTemplates.verifyEmail = {
    subject() {
        return `Verifica tu correo`;
    },
    html (user, url) {
        const urlWithoutHash = url.replace('#/', '');
        if (Meteor.isDevelopment) console.info('Verify email link: ', urlWithoutHash);
        SSR.compileTemplate('emailVerifyEmail', Assets.getText(emailVerifyEmail));
        return SSR.render('emailVerifyEmail', {
            urlWithoutHash,
            productSrc,
            logoSrc
        });
    }
};

if (Meteor.isDevelopment) {
    if (Meteor.settings.private?.MAIL_URL) {
        process.env.MAIL_URL = Meteor.settings.private.MAIL_URL;
        } else {
        console.warn('[Meteor + Vue] - Email settings are not configured, Emails will not be send');
    }
};