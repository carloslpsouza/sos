export declare global {
    namespace ReactNavigation {
        interface RootParamList {
            home: { hospitalId: String};
            ocorrencia: { idOcorrencia: String};
            incluiVitima: { idOcorrencia: String};
            new: { hospitalId: String};
            details: { orderId: String, hospitalId: String };
        }
    }
}