import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HStack, IconButton, VStack, useTheme, Text, Heading, FlatList, Center, Input, Icon, Box } from 'native-base';
import { SignOut, QrCode, House, FirstAid, MapPinLine, PersonSimpleRun } from 'phosphor-react-native';

import { dateFormat } from '../utils/firestoreDateFormats'

import Logo from '../assets/Logo.svg';
import { Button } from '../componentes/Button';

import { Loading } from '../componentes/Loading';
import { Out } from '../utils/Out';

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
    idOcorrencia: string; //Erro de tipo não pode ser und (Consultar navigation.d.ts)
}

type OcorrenciasT = {
    id: string,
    vtr?: string,
    dt_saida?: string,
    dt_chegada?: string,
    ocorrencia?: string,
    hospital?: string
}

export function Ocorrencia() {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [statusSelected, setStatusSelected] = useState<'open' | 'close'>('open');

    const [vetorOcorrencias, setvetorOcorrencias] = useState<OcorrenciasT[]>([]);
    //const [vetorOcorrencias, setvetorOcorrencias] = useState<OrderProps[]>([]);
    const [vtr, setVtr] = useState('');
    const [relato, setRelato] = useState('');


    const [inicial, setInicial] = useState(true);
    const [selVtr, setSelVtr] = useState(false);
    const [IncluiVitima, setIncluiVitima] = useState(false);
    const [chegadaLocal, setChegadaLocal] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { idOcorrencia } = route.params as RouteParams; // o route.params não sabe qual é então foi criada a tipagem acima


    const handleLogout = Out();

    function navRegVitimas() {
        atualizaDados(idOcorrencia);
        navigation.navigate('incluiVitima', { idOcorrencia })
    }

    function atualizaDados(idOco: string) {
        if (!relato) {
            //setInicial(true);
            //setSelVtr(false);
            return Alert.alert('VTR / Equipe', 'Verifique os campos e tente novamente');
        }
        //setIsLoading(true);
        firestore()
            .collection('OCORRENCIA')
            .doc(idOco)
            .update({
                ocorrencia: relato
            })
            .then(() => { //docRef retorna LastInsertID
                getOcorrencia(idOcorrencia);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
                return Alert.alert('VTR / Equipe', 'Não foi possivel gravar o registro.');
            });
    }

    function getOcorrencia(idOc: string) {
        const db = firestore();
        const docRef = db.collection('OCORRENCIA').doc(idOc);
        docRef.get().then((doc) => {
            if (doc.exists) {
                //console.log("Document data:", doc.data());
                const data = {
                    id: idOc,
                    vtr: doc.data().vtr,
                    dt_saida: dateFormat(doc.data().ts_saida_base),
                    dt_chegada: dateFormat(doc.data().ts_chegada_local)
                }
                setvetorOcorrencias([data]);
                console.log('Ocorrencia.tsx - getOcorrencia');                
                console.log(vetorOcorrencias);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
        //return false;
    }
    useEffect(() => {
        getOcorrencia(idOcorrencia)
    }, []);
    useEffect(() => {
        console.log('Ocorrencia.tsx - useEffect'); 
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

                <VStack flex={1} px={6} alignItems="center">
                    <Heading fontSize={16} mt={5} color="#fff">
                        RELATÓRIO INICIAL: { vetorOcorrencias[0] ? vetorOcorrencias[0].vtr.toString().toUpperCase() : isLoading}
                    </Heading>
                    <FlatList
                        w={'full'}
                        data={vetorOcorrencias}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <>
                                <VStack flex={1}
                                    bg="#FFFAF0"
                                    m={1}
                                    height={20}
                                    alignItems="center"
                                    justifyContent="space-between"
                                    rounded="sm"
                                    overflow="hidden">
                                    <HStack mt={5} mb={4}>
                                        <PersonSimpleRun size={26} color={colors.black} />
                                        <Text color="black" fontSize="md">Saída Base: {item.dt_saida}</Text>
                                    </HStack>
                                </VStack>
                                <VStack flex={1}
                                    bg="#FFFAF0"
                                    m={1}
                                    height={20}
                                    alignItems="center"
                                    justifyContent="space-between"
                                    rounded="sm"
                                    overflow="hidden">
                                    <HStack mt={5} mb={4}>
                                        <MapPinLine size={26} color={colors.black} />
                                        <Text color="black" fontSize="md">Chegada local: {item.dt_chegada}</Text>
                                    </HStack>
                                </VStack>
                            </>

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
                    <Input
                        bg="gray.600"
                        color={colors.light[100]}
                        placeholder='Descrição:'
                        placeholderTextColor={colors.light[100]}
                        onChangeText={setRelato}
                        textAlignVertical="top"
                        multiline
                        h={24}
                        m={4}
                    />
                    <Button title="Incluir vítima" mb={5} w={'full'} onPress={() => navRegVitimas()} />
                </VStack>

            </VStack>
        );
    }//inicial
}