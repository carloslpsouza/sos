import { useState, useEffect } from 'react';

import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { HStack, IconButton, VStack, useTheme, Text, Heading, FlatList, Center } from 'native-base';
import { SignOut } from 'phosphor-react-native';
import { ChatTeardropText } from 'phosphor-react-native';

import Logo from '../assets/Logo.svg';
import { Hospital, HospitalProps } from '../componentes/Hospital'

import { Loading } from '../componentes/Loading';
import { Out } from '../utils/Out';

type RouteParams = {
    hospitalId: string;
}

export function SelectHospital() {
    const [isLoading, setIsLoading] = useState(true);
    const { colors } = useTheme();
    const [hospitais, setHospitais] = useState<HospitalProps[]>([]);
    const [qtdeRegistros, setQtderegistros] = useState(0);
    
    const handleLogout = Out();

    const navigation = useNavigation();

    function handleSetaHospital(hospitalId: string) {
        console.log(hospitalId);
        navigation.navigate('home', { hospitalId })
    }

    useEffect(() => {
        setIsLoading(true);

        let arrTempHsp = [];
        let i = 0
        async function atendimentosPHospital(hospId: string, dt: {}, ct: number) {
            
            const q = firestore()
                .collection('ATENDIMENTO')
                .where('hospital', '==', hospId)
                .where('status', '==', 'open');
            const snap = await q.get();
            const em_aberto = snap.size;

            let temp = { ...dt, id: hospId, em_aberto }
            arrTempHsp.push(temp)
            //console.log(i);
            i -= 1
            if(i===0){
                setHospitais(arrTempHsp);
                setIsLoading(false);
            }                        
        }

        const subscribe = firestore()
            .collection('HOSPITAL')
            //.where('status', '==', 'valor')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => {
                    const { nm_hospital, latitude, longitude, bairro, cidade, lotacao } = doc.data();
                    i += 1
                    atendimentosPHospital(doc.id, doc.data(), i);
                    
                    return {
                        id: doc.id,
                        nm_hospital,
                        latitude,
                        longitude,
                        bairro,
                        cidade,
                        lotacao
                    }

                })
                //setHospitais(data);
                //console.log(data);
                setQtderegistros(data.length);
            });            
        return subscribe;
    }, []);

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
                <HStack w="full" mt={8} mb={4} justifyContent="space-between" alignItems="center">
                    <Heading fontSize={16} color="#fff">
                        Hospitais Disponíveis
                    </Heading>
                    <Text fontSize={16} color="#fff">
                        {qtdeRegistros}
                    </Text>
                </HStack>

                <HStack space={3} mb={8}>

                </HStack>
                {
                    isLoading ? <Loading /> :
                        <FlatList
                            data={hospitais}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <Hospital dataHospital={item} onPress={() => handleSetaHospital(item.id)} />}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            ListEmptyComponent={() => (
                                <Center>
                                    <ChatTeardropText color="#fff" size={40} />
                                </Center>
                            )}
                        />
                }

            </VStack>



        </VStack>
    );
}