import { Alert, Linking, Platform, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Heading, HStack, IconButton, KeyboardAvoidingView, useTheme, VStack, Text, FormControl, Select, Center } from 'native-base';
import { SignOut } from 'phosphor-react-native';
import { useNavigation, useRoute } from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import { Hourglass } from 'phosphor-react-native';

//Componentes
import { Input } from '../componentes/Input';
import InputMask from "../componentes/InputMask";
import { Button } from '../componentes/Button';


import Logo from '../assets/Logo.svg';
import { especColors } from "../styles/especColors"
import { Out } from '../utils/Out';
import { Hospital, HospitalProps } from '../componentes/Hospital';

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
    hospitalId: string; //Erro de tipo não pode ser und (Consultar navigation.d.ts)
    idOcorrencia?: string;
}

export function Register() {
    //Estilização & efeitos
    const [isLoading, setIsLoading] = useState(false);
    const [ocultaDados, setOcDados] = useState(false);
    const { colors } = useTheme();

    //Vetor de vitimas vindo do banco
    const [vetorVitimas, setVetorVitimas] = useState([]);

    //Informações hospital
    const [hospital, setHospital] = useState<HospitalProps>();
    const [origem, setOrigem] = useState('');
    const [destino, setDestino] = useState('');
    const [tempo, setTempo] = useState(null);
    const [distancia, setDistancia] = useState(null);

    //Dados pessoais das vitimas para o documento PACIENTE
    const [nmPaciente, setnmPaciente] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    //sinais vitais das vitimas para documento ATENDIMENTO
    const [pressao, setPressao] = useState('');
    const [frequencia, setFrequencia] = useState('');
    const [saturacao, setSaturacao] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [problema, setProblema] = useState('');
    const [risco, setRisco] = useState<Number>();
    const [corRisco, setCorRisco] = useState('')
    const [status, setStatus] = useState('open');

    //Navegação entre páginas
    const navigation = useNavigation();
    const route = useRoute();
    //informações vindas de Incluivitima.tsx (Typagem logo após os imports Linha 15)
    const { hospitalId, idOcorrencia } = route.params as RouteParams; // o route.params não sabe qual é então foi criada a tipagem acima

    const handleLogout = Out();

    function sinaisVitais(idPaciente: string) {
        if (!pressao || !frequencia || !saturacao) {
            return Alert.alert('Registrar', 'Verifique os campos e tente novamente');
        }
        setIsLoading(true);
        firestore()
            .collection('ATENDIMENTO')
            .add({
                hospital: hospitalId,
                paciente: idPaciente,
                pressao,
                frequencia,
                saturacao,
                temperatura,
                problema,
                risco,
                status,
                created_at: firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                Alert.alert('Entrada', 'Registrado com sucesso!');
                navigation.goBack();
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                return Alert.alert('Registrar', 'Não foi possivel gravar o registro.');
            });
    }

    function dadosPessoais() {
        if (!nmPaciente || !cpf) {
            return Alert.alert('Registrar', 'Verifique os campos e tente novamente');
        }
        setIsLoading(true);
        firestore()
            .collection('PACIENTE')
            .add({
                nmPaciente,
                cpf,
                telefone,
            })
            .then((docRef) => { //docRef retorna LastInsertID
                sinaisVitais(docRef.id)
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                return Alert.alert('Registrar', 'Não foi possivel gravar o registro.');
            });
    }

    function getHospital() {
        //console.log("getHosp");

        const db = firestore();
        const docRef = db.collection('HOSPITAL').doc(hospitalId);
        docRef.get().then((doc) => {
            if (doc.exists) {
                const data = doc.data() as HospitalProps
                console.log(data);
                setHospital(data);
            } else {
                // doc.data() will be undefined in this case
                console.log("getHospital: HS Não encontrado");
            }
            setDestino('[' + [hospital.longitude, hospital.latitude] + ']')
            //console.log(hospital.nm_hospital);
        }).catch((error) => {
            console.log("Error getHospital:", error);
        });
        //return false;
    }


    async function handleNewOrderRegister() {
        dadosPessoais()
    }

    function exibeDadosTriagem() {
        return (
            <VStack px={6}>
                <InputMask
                    value={pressao}
                    mask="pressao"
                    maxLength={6}
                    placeholder="Pressão"
                    placeholderTextColor={colors.black}
                    inputMaskChange={(text: string) => setPressao(text)}
                    keyboardType='number-pad'
                />
                <Input onChangeText={setFrequencia} placeholder="Frequência" mt={4} keyboardType='number-pad' returnKeyType='done' />
                <Input onChangeText={setSaturacao} placeholder="Saturação" mt={4} keyboardType='number-pad' returnKeyType='done' />
                <InputMask
                    value={temperatura}
                    mask="temperatura"
                    maxLength={6}
                    placeholder="Temperatura"
                    placeholderTextColor={colors.black}
                    inputMaskChange={(text: string) => setTemperatura(text)}
                    keyboardType='number-pad'
                />
                <Input
                    onChangeText={setProblema}
                    placeholder="Descrição do Problema"
                    flex={1}
                    mt={5}
                    textAlignVertical="top"
                    multiline
                    h={24}
                />
                <HStack space={4} justifyContent="space-between">
                    <Select
                        selectedValue={String(risco)}
                        flex={1}
                        minWidth="200"
                        accessibilityLabel="Grau de risco"
                        placeholder="Grau de risco"
                        fontSize={'lg'}
                        backgroundColor={corRisco}
                        _selectedItem={{
                            bg: corRisco,
                            _text: { color: colors.white }
                        }}
                        _item={{
                            _text: { color: colors.white }
                        }}
                        mt={2}
                        h={20}
                        onValueChange={(itemValue) => setRisco(Number(itemValue))}>
                        <Select.Item mt={2} backgroundColor={especColors.risco.naoUrgencia} label="Não é urgente" value="1" ></Select.Item>
                        <Select.Item mt={2} backgroundColor={especColors.risco.poucaUrgencia} label="Pouca urgência" value="2" />
                        <Select.Item mt={2} backgroundColor={especColors.risco.urgencia} label="Urgência" value="3" />
                        <Select.Item mt={2} backgroundColor={especColors.risco.muitaUrgencia} label="Muita urgência" value="4" />
                        <Select.Item mt={2} fontWeight="bold" backgroundColor={especColors.risco.emergencia} label="Emergência" value="5" />
                    </Select>
                </HStack>

                <Button
                    title="Cadastrar"
                    mt={5}
                    isLoading={isLoading}
                    onPress={handleNewOrderRegister}
                />
            </VStack>
        )
    }


    function ocultaDadosPessoais() {
        if (!nmPaciente || !cpf) {
            return Alert.alert('Registrar', 'Verifique os campos e tente novamente');
        }
        setOcDados(true);
    }

    function exibeDadosPessoais() {

        return (
            <VStack px={6}>
                <FormControl isRequired>
                    <Input isRequired onChangeText={setnmPaciente} placeholder="Nome" mt={4} returnKeyType='done' />
                    <InputMask
                        value={cpf}
                        mask="cpf"
                        maxLength={14}
                        placeholder="CPF"
                        placeholderTextColor={colors.black}
                        inputMaskChange={(text: string) => setCpf(text)}
                        keyboardType='number-pad'
                    />
                    <InputMask
                        value={telefone}
                        mask="phone"
                        maxLength={14}
                        placeholder="(99)9999-9999"
                        placeholderTextColor={colors.black}
                        inputMaskChange={(text: string) => setTelefone(text)}
                        keyboardType='number-pad'
                    />
                    <Button
                        title="Próximo"
                        mt={5}
                        isLoading={isLoading}
                        onPress={ocultaDadosPessoais}
                    />
                </FormControl>
            </VStack>
        )

    }


    function infoGeo(org: string, dst: string) {
        let request = new XMLHttpRequest();

        request.open('POST', "https://api.openrouteservice.org/v2/directions/driving-car/json");

        request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', '5b3ce3597851110001cf62485388f3fdaef64ec599ec37c1e19398ab');

        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                console.log('Status:', this.status);
                let temp = this.responseText;
                let temp1 = JSON.parse(temp);
                console.log(temp1.routes[0].summary);
                setDistancia((temp1.routes[0].summary.distance));
                //setTempo(temp1.routes[0].summary.duration);
                let tst = 600;
                if (tst > 6000) {
                    setTempo({ 'temp': (temp1.routes[0].summary.duration) / 60, 'tipo': 'horas' })
                } else {
                    setTempo({ 'temp': (temp1.routes[0].summary.duration) / 60, 'tipo': 'min' })
                }
            }
        };
        const body = '{"coordinates":[' + [org, dst] + ']}';
        //console.log(body);
        request.send(body);
    }

    function openGps(lat?: string, lng?: string, purl?: string) {
        var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:0,0?q=';
        //var url = scheme + `${lat},${lng}`;
        var url = scheme + `${purl}`;
        Linking.openURL(url);
        //console.log(infoGeo(origem.toString(), destino.toString()));
    }

    function pagResOcorrencia() {
        navigation.navigate('finalizaOcorrencia', { hospitalId, idOcorrencia });
    }

    useEffect(() => {
        Geolocation.getCurrentPosition(info => {
            console.log(info.coords)
            setOrigem('[' + [info.coords.longitude, info.coords.latitude] + ']')
        });
    }, []);

    useEffect(() => {
        getHospital();
    }, [origem]);

    useEffect(() => {
        exibeDadosPessoais();
        console.log(ocultaDados);
        console.log("hs: " + hospitalId);
        console.log("oc: " + idOcorrencia);
    }, [ocultaDados]);

    useEffect(() => {
        if (risco === 1) { setCorRisco(especColors.risco.naoUrgencia) }
        if (risco === 2) { setCorRisco(especColors.risco.poucaUrgencia) }
        if (risco === 3) { setCorRisco(especColors.risco.urgencia) }
        if (risco === 4) { setCorRisco(especColors.risco.muitaUrgencia) }
        if (risco === 5) { setCorRisco(especColors.risco.emergencia) }
        if (!risco) { setCorRisco(colors.white) }
    }, [risco]);

    useEffect(() => {
        console.log('org' + origem);
        console.log('dst' + destino);
        if (origem && destino) {
            infoGeo(origem.toString(), destino.toString())
        }
    }, [origem, destino]);

    useEffect(() => {
        console.log('================ > Register.tsx - useEffect');
        console.log('Hosp: ' + hospitalId);
        console.log('Ocor: ' + idOcorrencia);
        //getOcorrencia(idOcorrencia)
    }, []);

    return (
        <KeyboardAvoidingView
            behavior="height"
            keyboardVerticalOffset={80}
            style={{ flex: 1 }}
            bg={especColors.coresPadrao.bg0}
        >
            <ScrollView>
                <HStack
                    w="full"
                    justifyContent="space-between"
                    alignItems="center"
                    bg={especColors.coresPadrao.head0}
                    pt={1}
                    pb={1}
                    px={2}
                >
                    <Logo />
                    <IconButton
                        icon={<SignOut size={26} color={colors.black} />}
                        onPress={handleLogout}
                    />
                </HStack>

                <HStack bg={especColors.coresPadrao.bgTitulos} justifyContent="center" p={4}>
                    <Hourglass size={22} color={colors.green[300]} />
                    <Text
                        fontSize="sm"
                        ml={2}
                        textTransform="uppercase"
                        color={colors.green[300]}
                    >
                        Conduzir para Hospital
                    </Text>
                </HStack>
                <VStack justifyContent="center" p={4} space={1} alignItems="center">
                    <Heading textAlign={'center'}>
                        <Text
                            fontSize="sm"
                            ml={2}
                            textTransform="uppercase"
                            color={colors.white} >
                            Confirma a condução das vitimas para o hospital abaixo?
                        </Text>
                    </Heading>
                </VStack>
                <VStack w='full' bg={especColors.coresPadrao.bg1} space={1} alignItems="center">
                    <Heading>
                        <Text
                            textAlign='center'
                            fontSize="sm"
                            ml={2}
                            textTransform="uppercase"
                            color={colors.white} >
                            {hospital ? hospital.nm_hospital : isLoading}
                        </Text>
                    </Heading>
                    {
                        hospital ?
                            <>
                                <Hospital dataHospital={hospital} w='full' />
                                <Text color={colors.white}>Distância: {distancia ? (Number(distancia) / 1000).toFixed(2) + "km" : isLoading} </Text>
                                <Text color={colors.white}>Tempo para chegada: {tempo ? (tempo.temp).toFixed(2) + " " + tempo.tipo + "\n" : isLoading}</Text>
                            </>
                            :
                            isLoading
                    }
                </VStack>


            </ScrollView>
            <VStack w='full' space={1} mb={5}>
                <HStack
                    w="full"
                    justifyContent="space-between"
                    alignItems="center"
                    pt={1}
                    pb={1}
                    px={2}>
                    <Button title='Não' m={1} w='2/5' />
                    <Button title='Sim' m={1} w='2/5' onPress={() => { openGps(hospital.latitude, hospital.longitude, hospital.URL), pagResOcorrencia() }} />
                </HStack>
            </VStack>
        </KeyboardAvoidingView>

    );
}