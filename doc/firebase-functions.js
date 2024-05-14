const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const _ = require('lodash');
const path = require('path');
const os = require('os');
const cors = require('cors')({origin: true});
const request = require('request');
const UUID = require("uuid/v4");

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);




exports.notifications = functions.https.onRequest((req, res) => {


  let chave = req.body.chave;
  let uid = req.body.uid;
  let title = req.body.title;
  let body = req.body.body;

  let param = req.body;


  if (req.method === 'PUT') {
    res.status(403).send('Forbidden!');
  }

  if(!uid) {
    res.status(404).send('Uid Not found!');
  }

  if(!title) {
    res.status(404).send('Title Not found!');
  }



  cors(req, res, () => {

    const registration_ids = admin.database().ref(`/Users/${uid}/tokens`).once('value');
    //const data = admin.database().ref(`/userProfile/${uid}/config`).once('value');


    return Promise.all([registration_ids, param]).then(results => {
      const registration_ids = results[0];
      const param = results[1];
      //const data = results[2];

      let naolidas = "";

      if(param.naolidas) naolidas = param.naolidas;

      // Check if there are any device tokens.
      if (!registration_ids.hasChildren()) {
        res.status(404).send('Not found token!');
        return console.log('Não há tokens a enviar.');
      }
      console.log('Serão enviadas notificações para ', registration_ids.numChildren(), 'tokens.');
      console.log('UID selecionado', param.uid);

      // Notification details.
      const payload = {
        notification: {
          title: param.title,
          body: param.body,
          icon: 'icon_notification',
          sound: 'default'
        },
        data: {
          title: param.title,
          body: param.body,
          tipo: 'user',
        }
      };

      if(param.route) payload.data.route = param.route;

      //route: "{\"component\": \"cr-listar\",\"param\": \"\"}"

      var options = {
        priority: "high",
        timeToLive: 60 * 60
      };


      // Listing all tokens.
      const tokens = Object.keys(registration_ids.val());

      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload, options).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          console.log('Token: ',tokens[index]);
          const error = result.error;
          if (error) {
            console.error('Falhas no envio para os tokens ', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(registration_ids.ref.child(tokens[index]).remove());
            }
          }
        });
        let resultado = { 'enviados':  tokens, 'rejeitados': tokensToRemove};
        res.status(200).send(JSON.stringify(resultado));
        return Promise.all(tokensToRemove);
      });
      res.status(200).send(JSON.stringify(resultado));
    });


  });
});


exports.notificationsTopic = functions.https.onRequest((req, res) => {


  let chave = req.body.chave;
  let topic = req.body.topic;
  let title = req.body.title;
  let body = req.body.body;

  let param = req.body;


  if (req.method === 'PUT') {
    res.status(403).send('Forbidden!');
  }

  if(!topic) {
    res.status(404).send('Topic Not found!');
  }

  if(!title) {
    res.status(404).send('Title Not found!');
  }

  let naolidas = "1";

  cors(req, res, () => {


    return Promise.all([param]).then(results => {
      const param = results[0];

      if(param.chave != "abeuha93b3938dfdahasb38") {
        //res.status(404).send('Not found key!');
        //return data;
      }

      console.log('Topic selecionado', param.topic);

      // Notification details.
      const payload = {
        notification: {
          title: param.title,
          body: param.body,
          badge: naolidas,
          icon: 'icon_notification',
          click_action: "FCM_PLUGIN_ACTIVITY"
        },
        data: {
          title: param.title,
          body: param.body,
          tipo: 'topic',
          badge: naolidas,
        }
      };

      if(param.route) payload.data.route = param.route;

      //route: "{\"component\": \"cr-listar\",\"param\": \"\"}"

      var options = {
        priority: "high",
        timeToLive: 60 * 60
      };


      // Send notifications to all tokens.
      return admin.messaging().sendToTopic(topic, payload, options).then(response => {
        // For each message check if there was an error.
        
        
        let resultado = { 'enviados':  param.topic, 'resposta': response};
        res.status(200).send(JSON.stringify(response));
        return Promise.all(resultado);
      });
      res.status(200).send(JSON.stringify(response));
    });


  });
});


exports.syncUsers = functions.database.ref('/Users/{uid}')
    .onWrite((snapshot, context) => {
      const uid = context.params.uid;
      //const dados = snapshot.after.val();

      console.log('K4KSyncUsers', uid);

        var formData = {
          uid: uid,
          ChaveRemote: 'hdSeRTudIS729dj9eURsm',
          comando: 'K4KSyncUsers'
        };

        return request.post({url: 'http://kar4kids.mrjob.com.br/controller.php',form: formData}, function (err, httpResponse, body) {
          if (err) console.log('err', err);
          //console.log('httpResponse', httpResponse);
          console.log('body', body);
        });
      


});


exports.startStopKorrida = functions.database.ref('/DriverKorrida/{uid}/{key}/raceStatusID')
    .onUpdate((snapshot, context) => {

    const uid = context.params.uid;
    const key = context.params.key;
    const status = snapshot.after.val();

    var param = {'title': '', 'body': '' };

    if(status == 1) param = {'title': 'Korrida Iniciada', 'body': 'Acompanhe a Korrida pelo app' };
    else if(status == 2) {
      param = {'title': 'Korrida Concluída', 'body': 'Veja como foi a Korrida pelo app' };

      var formData = {
        uid: uid,
        key: key,
        ChaveRemote: 'hdSeRTudIS729dj9eURsm',
        comando: 'K4KStopKorrida'
      };

      request.post({url: 'http://kar4kids.mrjob.com.br/controller.php',form: formData}, function (err, httpResponse, body) {
        if (err) console.log('err', err);
        //console.log('httpResponse', httpResponse);
        console.log('body', body);
      });
    }
    else return console.log('Sem mensagens');

    const registration_tokens = admin.database().ref(`/DriverKorrida/${uid}/${key}/uidMother`).once('value').then(uidMotherVal => {

      const uidMother = uidMotherVal.val();
      //console.log(JSON.stringify(uidMotherVal));

      console.log('UID selecionado', uidMother);

      return admin.database().ref(`/Users/${uidMother}/tokens`).once('value');
      //const data = admin.database().ref(`/userProfile/${uid}/config`).once('value');

    }).catch((error) => {
        console.log('Error uidMother', error);
    });


    return Promise.all([registration_tokens, param]).then(results => {
      const registration_ids = results[0];
      const param = results[1];
      //const data = results[2];

      // Check if there are any device tokens.
      if (!registration_ids.hasChildren()) {
        return console.log('Não há tokens a enviar.');
      }
      console.log('Serão enviadas notificações para ', registration_ids.numChildren(), 'tokens.');
      

      // Notification details.
      const payload = {
        notification: {
          title: param.title,
          body: param.body,
          icon: 'icon_notification'
        },
        data: {
          title: param.title,
          body: param.body,
          tipo: 'user',
        }
      };

      if(param.route) payload.data.route = param.route;

      var options = {
        priority: "high",
        timeToLive: 60 * 60
      };


      // Listing all tokens.
      const tokens = Object.keys(registration_ids.val());

      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload, options).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          console.log('Token: ',tokens[index]);
          const error = result.error;
          if (error) {
            console.error('Falhas no envio para os tokens ', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(registration_ids.ref.child(tokens[index]).remove());
            }
          }
        });
        let resultado = { 'enviados':  tokens, 'rejeitados': tokensToRemove};
        //res.status(200).send(JSON.stringify(resultado));
        return Promise.all(tokensToRemove);
      });
      //res.status(200).send(JSON.stringify(resultado));
    });

      

});


exports.receivedKid = functions.database.ref('/DriverKorrida/{uid}/{key}/receivedKid')
    .onUpdate((snapshot, context) => {

    const uid = context.params.uid;
    const key = context.params.key;
    const status = snapshot.after.val();

    var param = {'title': '', 'body': '' };

    if(status == true) param = {'title': 'Criança Retirada', 'body': 'A sua mãetorista retirou a criança com sucesso!' };
    else return console.log('Sem mensagens');

    const registration_tokens = admin.database().ref(`/DriverKorrida/${uid}/${key}/uidMother`).once('value').then(uidMotherVal => {

      const uidMother = uidMotherVal.val();
      //console.log(JSON.stringify(uidMotherVal));

      console.log('UID selecionado', uidMother);

      return admin.database().ref(`/Users/${uidMother}/tokens`).once('value');
      //const data = admin.database().ref(`/userProfile/${uid}/config`).once('value');

    }).catch((error) => {
        console.log('Error uidMother', error);
    });


    return Promise.all([registration_tokens, param]).then(results => {
      const registration_ids = results[0];
      const param = results[1];
      //const data = results[2];

      // Check if there are any device tokens.
      if (!registration_ids.hasChildren()) {
        return console.log('Não há tokens a enviar.');
      }
      console.log('Serão enviadas notificações para ', registration_ids.numChildren(), 'tokens.');
      

      // Notification details.
      const payload = {
        notification: {
          title: param.title,
          body: param.body,
          icon: 'icon_notification'
        },
        data: {
          title: param.title,
          body: param.body,
          tipo: 'user',
        }
      };

      if(param.route) payload.data.route = param.route;

      var options = {
        priority: "high",
        timeToLive: 60 * 60
      };


      // Listing all tokens.
      const tokens = Object.keys(registration_ids.val());

      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload, options).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          console.log('Token: ',tokens[index]);
          const error = result.error;
          if (error) {
            console.error('Falhas no envio para os tokens ', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(registration_ids.ref.child(tokens[index]).remove());
            }
          }
        });
        let resultado = { 'enviados':  tokens, 'rejeitados': tokensToRemove};
        //res.status(200).send(JSON.stringify(resultado));
        return Promise.all(tokensToRemove);
      });
      //res.status(200).send(JSON.stringify(resultado));
    });

      

});

















exports.generateThumbnail = functions.storage.object('Users_images/{imageId}').onFinalize(event => {

  const object = event; // The Storage object.

  console.log(object)


  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
  const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

  const SIZES = [64, 128, 256, 512]; // Resize target width in pixels

  if (!contentType.startsWith('image/') || resourceState == 'not_exists') {
    console.log('This is not an image.');
    return;
  }

  if (_.includes(filePath, '_thumb')) {
    console.log('already processed image');
    return;
  }

  const arrayPath = filePath.split('/');
  const fileName = filePath.split('/').pop();
  const bucket = admin.storage().bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  if (fileName != 'profile.jpg') {
    console.log('Imagem não habilitada');
    return;
  }

  return bucket.file(filePath).download({
    destination: tempFilePath
  }).then(() => {

    _.each(SIZES, (size) => {

      let newFileName = `${fileName}_${size}_thumb.jpeg`
      let newFileTemp = path.join(os.tmpdir(), newFileName);
      //let newFilePath = `Users_images/${arrayPath[1]}/${arrayPath[2]}/${arrayPath[3]}/${newFileName}`
      let newFilePath = `Users_images/${arrayPath[1]}/${arrayPath[2]}/${newFileName}`
      let url = '';

      sharp(tempFilePath)
        .resize(size, null)
        .toFormat('jpeg')
        .toFile(newFileTemp, (err, info) => {

        let uuid = UUID();
        console.log("uuid --> ", uuid);

        bucket.upload(newFileTemp, {
              destination: newFilePath,
              metadata: {
              metadata: {
                firebaseStorageDownloadTokens: uuid
              }
          }
        }).then((resp) => {

          console.log("name --> ", newFilePath);

          //const expires = new Date().getTime() + 10 * 1000;

          url = "https://firebasestorage.googleapis.com/v0/b/kar4kids-1559332905364.appspot.com/o/"+encodeURIComponent(newFilePath)+"?alt=media&token="+uuid;

            console.log("url --> ", url);


            if(size == 64) {
              admin.database().ref(`/Users/${arrayPath[1]}/public/${arrayPath[2]}/${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

            if(size == 128) {
              admin.database().ref(`/Users/${arrayPath[1]}/public/${arrayPath[2]}/${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

            if(size == 256) {
              admin.database().ref(`/Users/${arrayPath[1]}/public/${arrayPath[2]}/${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

            if(size == 512) {
              admin.database().ref(`/Users/${arrayPath[1]}/public/${arrayPath[2]}/${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

          console.log("upload done --> ", resp);

        });

        

      });

    })
  })
})

exports.generateThumbnailKids = functions.storage.object('Kids_images/{imageId}').onFinalize(event => {

  const object = event; // The Storage object.

  console.log(object)


  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
  const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

  const SIZES = [64, 128, 256, 512]; // Resize target width in pixels

  if (!contentType.startsWith('image/') || resourceState == 'not_exists') {
    console.log('This is not an image.');
    return;
  }

  if (_.includes(filePath, '_thumb')) {
    console.log('already processed image');
    return;
  }

  const arrayPath = filePath.split('/');
  const fileName = filePath.split('/').pop();
  const bucket = admin.storage().bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  if (fileName != 'kidImage.jpg') {
    console.log('Imagem não habilitada '+fileName);
    return;
  }

  return bucket.file(filePath).download({
    destination: tempFilePath
  }).then(() => {

    _.each(SIZES, (size) => {

      let newFileName = `${fileName}_${size}_thumb.jpeg`
      let newFileTemp = path.join(os.tmpdir(), newFileName);
      //let newFilePath = `Users_images/${arrayPath[1]}/${arrayPath[2]}/${arrayPath[3]}/${newFileName}`
      let newFilePath = `Kids_images/${arrayPath[1]}/${arrayPath[2]}/${newFileName}`
      let url = '';

      sharp(tempFilePath)
        .resize(size, null)
        .toFormat('jpeg')
        .toFile(newFileTemp, (err, info) => {

        let uuid = UUID();
        console.log("uuid --> ", uuid);

        bucket.upload(newFileTemp, {
              destination: newFilePath,
              metadata: {
              metadata: {
                firebaseStorageDownloadTokens: uuid
              }
          }
        }).then((resp) => {

          console.log("name --> ", newFilePath);

          //const expires = new Date().getTime() + 10 * 1000;

          url = "https://firebasestorage.googleapis.com/v0/b/kar4kids-1559332905364.appspot.com/o/"+encodeURIComponent(newFilePath)+"?alt=media&token="+uuid;

            console.log("url --> ", url);


            if(size == 64) {
              admin.database().ref(`/Kids/${arrayPath[2]}/ProfilePhotos/photo${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

            if(size == 128) {
              admin.database().ref(`/Kids/${arrayPath[2]}/ProfilePhotos/photo${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

            if(size == 256) {
              admin.database().ref(`/Kids/${arrayPath[2]}/ProfilePhotos/photo${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

            if(size == 512) {
              admin.database().ref(`/Kids/${arrayPath[2]}/ProfilePhotos/photo${size}`)
              .update({photoURL: url, uuid: uuid}).then(snapshot => {});
            }

          console.log("upload done --> ", resp);

        });

        

      });

    })
  })
})
