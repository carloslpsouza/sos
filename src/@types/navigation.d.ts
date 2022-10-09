export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            home: { hospitalId: String };
            ocorrencia: { idOcorrencia: String } ;
            incluiVitima: { idOcorrencia: String };
            resumoOcorrencia: {  idOcorrencia: String  };
            SelectHospital: {  idOcorrencia: String  };
            new: { hospitalId: String, idOcorrencia?: string };
            details: { orderId: String, hospitalId: String };
        }
    }
}