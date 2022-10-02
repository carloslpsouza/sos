import { Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Heading, HStack, IconButton, KeyboardAvoidingView, useTheme, VStack, Text, FormControl, Select } from 'native-base';
import { SignOut } from 'phosphor-react-native';
import { useNavigation, useRoute } from '@react-navigation/native'
import { Hourglass } from 'phosphor-react-native';
import { Input } from '../componentes/Input';
import InputMask from "../componentes/InputMask";
import { Button } from '../componentes/Button';
import firestore from '@react-native-firebase/firestore';
import Logo from '../assets/Logo.svg';
import { especColors } from "../styles/especColors"
import { Out } from '../utils/Out';

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
    hospitalId: string; //Erro de tipo não pode ser und (Consultar navigation.d.ts)
}

export function Register() {
    const [isLoading, setIsLoading] = useState(false);

    const [nmPaciente, setnmPaciente] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');

    const [pressao, setPressao] = useState('');
    const [frequencia, setFrequencia] = useState('');
    const [saturacao, setSaturacao] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [problema, setProblema] = useState('');
    const [risco, setRisco] = useState<Number>();
    const [corRisco, setCorRisco] = useState('')
    const [status, setStatus] = useState('open');
    const [ocultaDados, setOcDados] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { hospitalId } = route.params as RouteParams; // o route.params não sabe qual é então foi criada a tipagem acima

    const handleLogout = Out();
    const { colors } = useTheme();
    
    function sinaisVitais(idPaciente: string) {
        if (!pressao || !frequencia || !saturacao || !temperatura) {
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
                            _text:{color:colors.white} 
                        }}
                        _item={{
                            _text:{color:colors.white}                            
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

    useEffect(() => {
        exibeDadosPessoais();
        console.log(ocultaDados);
        console.log(hospitalId);

    }, [ocultaDados])

    useEffect(() => {
        if(risco === 1){setCorRisco(especColors.risco.naoUrgencia)}
        if(risco === 2){setCorRisco(especColors.risco.poucaUrgencia)}
        if(risco === 3){setCorRisco(especColors.risco.urgencia)}
        if(risco === 4){setCorRisco(especColors.risco.muitaUrgencia)}
        if(risco === 5){setCorRisco(especColors.risco.emergencia)}
        if(!risco){setCorRisco(colors.white)}
    }, [risco])

    return (
        <KeyboardAvoidingView
            behavior="height"
            keyboardVerticalOffset={80}
            style={{ flex: 1 }}
            bg="#565656"
        >
            <ScrollView>
                <HStack
                    w="full"
                    justifyContent="space-between"
                    alignItems="center"
                    bg="#FFFAF0"
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

                <HStack bg="gray.500" justifyContent="center" p={4}>
                    <Hourglass size={22} color={colors.green[300]} />
                    <Text
                        fontSize="sm"
                        ml={2}
                        textTransform="uppercase"
                        color={colors.green[300]}
                    >
                        Novo Paciente
                    </Text>
                </HStack>

                { ocultaDados ? exibeDadosTriagem() : exibeDadosPessoais() }


            </ScrollView>
        </KeyboardAvoidingView>

    );
}