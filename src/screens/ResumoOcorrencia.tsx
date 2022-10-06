import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HStack, IconButton, VStack, useTheme, Text, Heading, FlatList, Center, Input, Icon, Box, Select, FormControl, Radio, ScrollView } from 'native-base';
import { SignOut, House, FirstAid, MapPinLine, PersonSimpleRun } from 'phosphor-react-native';

import { dateFormat } from '../utils/firestoreDateFormats'

import Logo from '../assets/Logo.svg';
import { Button } from '../componentes/Button';

import { Loading } from '../componentes/Loading';
import { Out } from '../utils/Out';
import { especColors } from "../styles/especColors"
import InputMask from '../componentes/InputMask';
import { msg } from "../utils/mensagensPadrao"

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
    idOcorrencia: string; //Erro de tipo não pode ser und (Consultar navigation.d.ts)
}

type OcorrenciasType = {
    id: string,
    vtr: string,
    dt_saida?: string,
    dt_chegada?: string,
    ocorrencia?: string,
    hospital?: string
}

export function ResumoOcorrencia() {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    const [vetorOcorrencias, setVetorOcorrencias] = useState<OcorrenciasType[]>([]);
    const [vetorVitimas, setVetorVitimas] = useState([]);
    const [inicial, setInicial] = useState(true);
    const [IncluiVitima, setIncluiVitima] = useState(false);
    const [chegadaLocal, setChegadaLocal] = useState(false);
    const [ocultaDados, setOcDados] = useState(false);

    const [nmPaciente, setnmPaciente] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');

    const [pressao, setPressao] = useState('');
    const [frequencia, setFrequencia] = useState('');
    const [saturacao, setSaturacao] = useState('');
    const [risco, setRisco] = useState<Number>(1);
    const [observacoes, setObservacoes] = useState('');
    const [corRisco, setCorRisco] = useState('');


    const navigation = useNavigation();
    const route = useRoute();
    const { idOcorrencia } = route.params as RouteParams; // o route.params não sabe qual é então foi criada a tipagem acima


    const handleLogout = Out();

    const riscoPadrao = (par: number) => {
        if (par === 1) { return { 'cor': especColors.risco.naoUrgencia, 'msg': msg.risco.naoUrgencia }; }
        if (par === 2) { return { 'cor': especColors.risco.poucaUrgencia, 'msg': msg.risco.poucaUrgencia }; }
        if (par === 3) { return { 'cor': especColors.risco.urgencia, 'msg': msg.risco.urgencia }; }
        if (par === 4) { return { 'cor': especColors.risco.muitaUrgencia, 'msg': msg.risco.muitaUrgencia }; }
        if (par === 5) { return { 'cor': especColors.risco.emergencia, 'msg': msg.risco.emergencia }; }
    }

    function pagHome() {
        return (
            <VStack flex={1} px={6} alignItems="center" w={'full'}>
                <VStack w={'full'} h='1/6'>
                    <Heading fontSize={16} mt={5} color="#fff">
                        INCLUIR VITIMA
                    </Heading>
                </VStack>
                <HStack w={'full'} h='5/6'>
                    <FlatList
                        data={vetorVitimas}
                        keyExtractor={item => item.id}
                        w='full'
                        renderItem={({ item }) => (
                            <VStack flex={1}
                                bg="#FFFAF0"
                                m={1}
                                w='full'
                                alignItems="center"
                                justifyContent="space-between"
                                rounded="sm"
                                overflow="hidden"
                            >

                                <HStack >
                                    <Box h="full" w={6} bg={riscoPadrao(Number(item.Risco)).cor} />
                                    <HStack w='full' h='20' pt={1} pb={1}>
                                        <Text color="black" fontSize="md" m={1} alignItems='center'>
                                            Vitima: {item.Nome ? item.Nome : 'Desconhecido'}
                                            {item.CPF ? " | CPF: " + item.CPF : null}
                                            {'\n'}
                                            Press: {item.Pressão} |
                                            Freq: {item.Frequência} |
                                            Sat: {item.Saturação}
                                        </Text>
                                    </HStack>
                                </HStack>


                            </VStack>
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 0 }}
                        ListEmptyComponent={() => (
                            <Center>
                                <Text color="#fff" fontSize="xl" mt={6} textAlign="center">
                                    Sem vitimas cadastradas{'\n'}
                                </Text>
                            </Center>
                        )}
                    />
                </HStack>
                <VStack w={'full'}>
                    <IconButton
                        icon={<FirstAid color="white" size={50} />}
                        onPress={exibeForm}
                    />
                    <Button title="Registrar saída" mb={5} w={'full'} onPress={() => atualizaDados(idOcorrencia, "1")} />
                </VStack>
            </VStack>
        )
    }

    function pagVitima() {
        return (
            <>
                {ocultaDados ? exibeDadosTriagem() : exibeDadosPessoais()}
            </>
        )
    }

    function pagChegada() {
        return (
            <VStack flex={1} px={6} alignItems="center">
                <Heading fontSize={16} mt={5} color="#fff">
                    CHEGADA AO LOCAL
                </Heading>
                <FlatList
                    data={vetorOcorrencias}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <VStack flex={1}
                            bg="#FFFAF0"
                            m={1}
                            height={20}
                            alignItems="center"
                            justifyContent="space-between"
                            rounded="sm"
                            overflow="hidden">
                            <Text color="black" fontSize="md" m={5}>Saída de Base: {item.dt_saida}</Text>
                        </VStack>
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    ListEmptyComponent={() => (
                        <Center>
                            <Text color="#fff" fontSize="xl" mt={6} textAlign="center">
                                {'\n'}
                            </Text>
                        </Center>
                    )}
                />
                <IconButton
                    icon={<House color="white" size={100} />}
                    onPress={navHome}
                />
                <Button title="Registrar chegada" mb={5} w={'full'} onPress={() => navCheg()} />
            </VStack>
        )
    }

    function navCheg() {
        getOcorrencia(idOcorrencia)
        setIncluiVitima(false);
        setChegadaLocal(true);
    }

    function navHome() {
        setChegadaLocal(true);
        setInicial(true);
    }

    function exibeForm() {
        setInicial(false)
        setOcDados(true)
        setIncluiVitima(true)
    }

    function exibeDadosTriagem() {
        return (
            <VStack px={6} minH='3/4'>
                <InputMask
                    value={pressao}
                    mask="pressao"
                    maxLength={6}
                    placeholder="Pressão"
                    placeholderTextColor={colors.black}
                    inputMaskChange={(text: string) => setPressao(text)}
                    keyboardType='number-pad'
                />
                <InputMask
                    value={frequencia}
                    mask="default"
                    maxLength={6}
                    placeholder="Frequência"
                    placeholderTextColor={colors.black}
                    inputMaskChange={(text: string) => setFrequencia(text)}
                    keyboardType='number-pad'
                />
                <InputMask
                    value={saturacao}
                    mask="default"
                    maxLength={6}
                    placeholder="Saturação"
                    placeholderTextColor={colors.black}
                    inputMaskChange={(text: string) => setSaturacao(text)}
                    keyboardType='number-pad'
                />
                <Input
                    bg="gray.600"
                    color={colors.light[100]}
                    placeholder='Observações:'
                    placeholderTextColor={colors.light[100]}
                    onChangeText={setObservacoes}
                    textAlignVertical="top"
                    multiline
                    h={24}
                    mt={4}
                />
                <Select
                    selectedValue={String(risco)}
                    flex={1}
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
                    onValueChange={(itemValue) => setRisco(Number(itemValue))}
                >
                    <Select.Item mt={2} backgroundColor={especColors.risco.naoUrgencia} label="Não é urgente" value="1" />
                    <Select.Item mt={2} backgroundColor={especColors.risco.poucaUrgencia} label="Pouca urgência" value="2" />
                    <Select.Item mt={2} backgroundColor={especColors.risco.urgencia} label="Urgência" value="3" />
                    <Select.Item mt={2} backgroundColor={especColors.risco.muitaUrgencia} label="Muita urgência" value="4" />
                    <Select.Item mt={2} backgroundColor={especColors.risco.emergencia} label="Emergência" value="5" />
                </Select>
                <Text color={colors.white}>
                    TEM OS DADOS DA VÍTIMA?
                </Text>
                <Radio.Group
                    defaultValue="1"
                    name="myRadioGroup"
                    accessibilityLabel="Vítima Consciente?"
                >
                    <Radio _text={{ color: "#FFF" }} value="1" my={1} >
                        Não
                    </Radio>
                    <Radio value="2" my={1} color={colors.white} onTouchEnd={() => setOcDados(false)}>
                        Sim
                    </Radio>
                </Radio.Group>

                <Button
                    title="Salvar"
                    mt={5}
                    onPress={arrVitimas}
                />
            </VStack>
        )
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
                        title="Salvar"
                        mt={5}
                        //isLoading={isLoading}
                        onPress={arrVitimas}
                    />
                </FormControl>
            </VStack>
        )

    }

    function atualizaDados(idOco: string, subdoc?: string) {
        const db = firestore().collection('OCORRENCIA')
        if (!vetorVitimas) {
            return Alert.alert('Incluir Vítimas', 'Verifique os campos e tente novamente');
        }
        db.doc(idOco)
            .update({
                ts_saida_local: firestore.FieldValue.serverTimestamp(),
                vitimas: vetorVitimas
            })
            .then(() => {
                getOcorrencia(idOcorrencia);
            })
            .catch((error) => {
                setIsLoading(false);
                return Alert.alert('Incluir Vítimas', 'Não foi possivel gravar o registro.');
            });
        //setIsLoading(true);
    }

    function getOcorrencia(idOc: string) {
        const db = firestore();
        const docRef = db.collection('OCORRENCIA').doc(idOc);
        docRef.get().then((doc) => {
            if (doc.data().exists) {
                //console.log("Document data:", doc.data());
                const data = {
                    id: idOc,
                    vtr: doc.data().vtr,
                    dt_saida: dateFormat(doc.data().ts_saida_base),
                    dt_chegada: dateFormat(doc.data().ts_chegada_local)
                }
                setVetorOcorrencias([data]);
                //console.log(vetorOcorrencias);

            } else {
                // doc.data() will be undefined in this case
                //console.log("getOcorrencia(): No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
        //return false;
    }

    function arrVitimas() {
        const objTemp = {
            "Pressão": pressao,
            "Frequência": frequencia,
            "Saturação": saturacao,
            "Observações": observacoes,
            "Risco": risco,
            "Nome": nmPaciente,
            "CPF": cpf,
            "Telefone": telefone
        }
        vetorVitimas.push(objTemp);
        //console.log(vetorVitimas);
        setIncluiVitima(false);
        setInicial(true);
    }

    useEffect(() => {
        getOcorrencia(idOcorrencia)
    }, []);

    useEffect(() => {
        if (risco === 1) { setCorRisco(especColors.risco.naoUrgencia) }
        if (risco === 2) { setCorRisco(especColors.risco.poucaUrgencia) }
        if (risco === 3) { setCorRisco(especColors.risco.urgencia) }
        if (risco === 4) { setCorRisco(especColors.risco.muitaUrgencia) }
        if (risco === 5) { setCorRisco(especColors.risco.emergencia) }
        if (!risco) { setCorRisco(colors.white) }
    }, [risco]);

    return (
        <>
            <VStack flex={1} pb={1} bg="#565656" h='1/4'>
                <HStack w="full" justifyContent="space-between" alignItems="center" bg="#FFFAF0" pt={1} pb={1} px={2}>
                    <Logo />
                    <IconButton
                        icon={<SignOut size={26} color={colors.black} />}
                        onPress={handleLogout}
                    />
                </HStack>
                <VStack w="full" h='2/4'>
                    {inicial && pagHome()}
                    {IncluiVitima && pagVitima()}
                    {chegadaLocal && pagChegada()}
                </VStack>
            </VStack>
        </>

    );
}