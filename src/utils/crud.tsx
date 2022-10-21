import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { dateFormat } from './firestoreDateFormats';

export function getOcorrencia(IDDOC: string, SOLICITANTE?: string) {
  console.log("Parametros: " + IDDOC, SOLICITANTE);

  return new Promise((resolve, reject) => {

    const docRef = firestore().collection('OCORRENCIA').doc(IDDOC);
    docRef.get().then((doc) => {
      if (doc.exists) {
        let dt = doc.data();
        //console.log(SOLICITANTE + " Data: ");
        //console.log(data);
        resolve(dt);
      } else {
        // doc.data() will be undefined in this case            
        reject(console.log(SOLICITANTE + ": Documento não encontrado"));
      }
    }).catch((error) => {
      console.log(SOLICITANTE + ": Erro buscando Documento:", error);
    });

  })
}


export function getOcorrenciaSnap(COLLECTION: string, IDDOC: string, SOLICITANTE?: string) {
  console.log("Parametros: " + COLLECTION, IDDOC, SOLICITANTE);

  return new Promise((resolve, reject) => {

    firestore().collection(COLLECTION).doc(IDDOC)
      .onSnapshot((doc) => {
        //console.log(SOLICITANTE + ": ");
        //console.log(doc.data());
        const data = doc.data();
        resolve(data)
      }, (error) => {
        reject(console.log(SOLICITANTE + ": Documento não encontrado" + error));
      });

  });
}

export function atualizaDados(IDDOC: string, DATA: any, SOLICITANTE?: string, MSG?: string) {
  console.log("Parametros: " + IDDOC, SOLICITANTE, DATA);

  return new Promise((resolve, reject) => {
    if (!DATA) {
      return Alert.alert(MSG, 'Verifique os campos e tente novamente');
    }
    firestore().collection('OCORRENCIA').doc(IDDOC)
      .update(
        DATA
      )
      .then(() => {
        console.log(SOLICITANTE + " - Update com sucesso! ");
        resolve(true);
      })
      .catch((error) => {
        reject(SOLICITANTE + " - Falha na atualização: " + error);
      });
  })
}



export function gravaDados(COLLECTION: string, DATA: any, SOLICITANTE: string, MSG: string) {
  console.log("Parametros: " + COLLECTION, SOLICITANTE);

  return new Promise((resolve, reject) => {
    if (!DATA) {
      return Alert.alert(MSG, 'Verifique os campos e tente novamente');
    }
    firestore()
      .collection(COLLECTION)
      .add(DATA.sinaisVitais)
      .then((docRef) => { //docRef retorna LastInsertID
        console.log(SOLICITANTE + " - Gravado com sucesso! ID do documento: " + docRef.id);
        resolve(docRef.id)
      })
      .catch((error) => {
        reject(console.log(SOLICITANTE + ": Erro na gravação: " + error));
        return Alert.alert(MSG, 'Não foi possivel gravar o registro.');
      });
  })
}

function sinaisVitais(idPaciente: string, DATA: any, DATAOCORRENCIA: any) {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('ATENDIMENTO')
      .add({paciente:idPaciente, ...DATA.sinaisVitais, ...DATAOCORRENCIA}) //ver como unir o ID com o resto do objeto json
      .then(() => {
        console.log('Entrada', 'Registrado com sucesso!');
      })
      .catch((error) => {
        console.log(error);
        console.log('Registrar', 'Não foi possivel gravar o registro.');
      });
    resolve(true)
  })
}

function dadosPessoais(DATA: any, DATAOCORRENCIA: any) {
  return new Promise((resolve, reject) => {
    firestore()
      .collection('PACIENTE')
      .add(DATA.dadosPessoais)
      .then((docRef) => { //docRef retorna LastInsertID
        sinaisVitais(docRef.id, DATA, DATAOCORRENCIA)
      })
      .catch((error) => {
        console.log(error);
        console.log('Registrar', 'Não foi possivel gravar o registro.');
      });
    resolve(true)
  })
}

export function transfereHospital(DATA: any, DATAOCORRENCIA: any, SOLICITANTE?: string, MSG?: string) {
  console.log("Parametros: " + SOLICITANTE, DATA.length, DATA);

  return new Promise((resolve, reject) => {
    DATA.forEach((DATA)=>{dadosPessoais(DATA, DATAOCORRENCIA)})
    resolve(true)
  })
}