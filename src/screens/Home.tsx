import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { HStack, IconButton, VStack, useTheme, Text, Heading, FlatList, Center, Input, Icon, Box } from 'native-base';
import { SignOut, QrCode, House } from 'phosphor-react-native';

import firestore from '@react-native-firebase/firestore';

import { useNavigation, useRoute } from '@react-navigation/native';

import { dateFormat } from '../utils/firestoreDateFormats'

import Logo from '../assets/Logo.svg';
import { Button } from '../componentes/Button';

import { Loading } from '../componentes/Loading';
import { Out } from '../utils/Out';

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
    idOcorrencia: string; //Erro de tipo não pode ser und (Consultar navigation.d.ts)
}

export function Home() {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    const [vetorOcorrencias, setVetorOcorrencias] = useState([]);
    const [vtr, setVtr] = useState('');

    const [inicial, setInicial] = useState(true);
    const [insereVtr, setinsereVtr] = useState(false);
    const [saidaBase, setSaidaBase] = useState(false);
    const [chegadaLocal, setChegadaLocal] = useState(false);
    const [idOcorrencia, setIdOcorrencia] = useState('');

    const navigation = useNavigation();
    const route = useRoute();


    const handleLogout = Out();

    function novaOcorrencia() {//
        setInicial(false);
        setinsereVtr(true); // Mostra Input para viatura
    }

    function navRegSaidaBase() {//==>Navega até Seleciona VTR
        gravaDados();
        setinsereVtr(false);
        setSaidaBase(true);
    }

    function navInsChegLocal() {
        setSaidaBase(false);
        setChegadaLocal(true);
    }

    function navHome() {
        setChegadaLocal(false);
        setInicial(true);
    }

    function gravaDados() {
        if (!vtr) {
            setInicial(true);
            setinsereVtr(false);
            return Alert.alert('VTR / Equipe', 'Verifique os campos e tente novamente');
        }
        //setIsLoading(true);
        firestore()
            .collection('OCORRENCIA')
            .add({
                vtr,
                ts_saida_base: firestore.FieldValue.serverTimestamp()
            })
            .then((docRef) => { //docRef retorna LastInsertID
                console.log(docRef.id);
                setIdOcorrencia(docRef.id);
                getOcorrencia(docRef.id);
                //navigation.navigate('ocorrencia', { idOcorrencia })
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                return Alert.alert('VTR / Equipe', 'Não foi possivel gravar o registro.');
            });
    }

    function atualizaDados(idOco: string) {
        //setIsLoading(true);
        firestore()
            .collection('OCORRENCIA')
            .doc(idOco)
            .update({
                ts_chegada_local: firestore.FieldValue.serverTimestamp()
            })
            .then(() => { //docRef retorna LastInsertID
                getOcorrencia(idOcorrencia);
                navigation.navigate('ocorrencia', { idOcorrencia });
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                return Alert.alert('VTR / Equipe', 'Não foi possivel gravar o registro.');
            });
    }

    function getOcorrencia(idOco: string) {
        firestore()
        .collection("OCORRENCIA")
        .doc(idOco)
        .onSnapshot((doc) => {
        //console.log("Current data: ", doc.data());
        const data = {
            id: idOco,
            vtr: doc.data().vtr,
            dt_saida: dateFormat(doc.data().ts_saida_base)
        }
        setVetorOcorrencias([data]);
        console.log(vetorOcorrencias);
        
    });
    }

    useEffect(() => {
        //getOcorrencia(idOcorrencia)
    }, []);

    if (!inicial) { //Componente só renderiza para estruturar useEffect
        <VStack />
    }

    if (inicial) {
        return (
            <VStack flex={1} pb={1} bg="#565656">
                <HStack w="full" justifyContent="space-between" alignItems="center" bg="#FFFAF0" pt={1} pb={1} px={2}>
                    <Logo />
                    <IconButton
                        icon={<SignOut size={26} color={colors.black} />}
                        onPress={handleLogout}
                    />
                </HStack>

                <VStack flex={1} px={6}>
                    <HStack space={3} mb={8}>
                    </HStack>

                    <Button title="Minhas ocorrências" mb={5} /* onPress={/* () => handleNewOrder(hospitalId) } */ />
                    <Button title="Nova ocorrencia" mb={5} onPress={() => novaOcorrencia()} />
                </VStack>

            </VStack>
        );
    }//inicial
    if (insereVtr) {
        return (
            <VStack flex={1} pb={1} bg="#565656">
                <HStack w="full" justifyContent="space-between" alignItems="center" bg="#FFFAF0" pt={1} pb={1} px={2}>
                    <Logo />
                    <IconButton
                        icon={<SignOut size={26} color={colors.black} />}
                        onPress={handleLogout}
                    />
                </HStack>

                <VStack flex={1} px={6} alignItems="center">
                    <Heading fontSize={16} mt={5} color="#fff">
                        EQUIPE OU VTR
                    </Heading>
                    <Icon as={<QrCode color="white" size={100} />} m={5} />
                    <Input color={colors.white} placeholder="Equipe ou VTR" m={5} onChangeText={setVtr} />
                    <Button title="Avançar" mb={5} w={'full'} onPress={() => navRegSaidaBase()} />
                </VStack>

            </VStack>
        );
    }//insereVtr
    if (saidaBase) {
        return (
            <VStack flex={1} w="full" h='full' justifyContent="space-between" pb={1} bg="#565656">
                <HStack alignItems="center" bg="#FFFAF0" pt={1} pb={1} px={2}>
                    <Logo />
                    <IconButton
                        icon={<SignOut size={26} color={colors.black} />}
                        onPress={handleLogout}
                    />
                </HStack>

                <VStack flex={1} px={6} alignItems="center">
                    <Heading fontSize={16} mt={5} color="#fff">
                        SAÍDA DA BASE: { vetorOcorrencias[0] ? vetorOcorrencias[0].vtr.toString().toUpperCase() : null }
                    </Heading>
                    <Button title="Registrar saída" mb={5} w={'full'} onPress={() => navInsChegLocal()} />
                </VStack>

            </VStack>
        );
    }//saidaBase
    if (chegadaLocal) {
        return (
            <VStack flex={1} pb={1} bg="#565656">
                <HStack w="full" justifyContent="space-between" alignItems="center" bg="#FFFAF0" pt={1} pb={1} px={2}>
                    <Logo />
                    <IconButton
                        icon={<SignOut size={26} color={colors.black} />}
                        onPress={handleLogout}
                    />
                </HStack>

                <VStack flex={1} px={6} alignItems="center">
                    <Heading fontSize={16} mt={5} color="#fff">
                        CHEGADA AO LOCAL:  {  vetorOcorrencias[0] ? vetorOcorrencias[0].vtr.toString().toUpperCase() : null }
                    </Heading>
                    <FlatList
                        data={vetorOcorrencias}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <VStack flex={1}
                                bg="#FFFAF0"
                                mt={2}
                                mb={2}
                                height={16}
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
                    <Button title="Registrar chegada" mb={5} w={'full'} onPress={() => atualizaDados(idOcorrencia)} />
                </VStack>

            </VStack>
        );
    }//chegadaLocal
}