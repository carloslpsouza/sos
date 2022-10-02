import { useState, useEffect } from 'react';

import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HStack, IconButton, VStack, useTheme, Text, Heading, FlatList, Center } from 'native-base';
import { SignOut } from 'phosphor-react-native';

import { dateFormat } from '../utils/firestoreDateFormats'

import Logo from '../assets/Logo.svg';
import { Filter } from '../componentes/Filter';
import { Button } from '../componentes/Button';
import { Order, OrderProps } from '../componentes/Order'

import { Loading } from '../componentes/Loading';
import { Out } from '../utils/Out';

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
    hospitalId: string; //Erro de tipo não pode ser und (Consultar navigation.d.ts)
}

export function Home() {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [statusSelected, setStatusSelected] = useState<'open' | 'close'>('open');

    const [orders, setOrders] = useState<OrderProps[]>([]);
    const [pacientes, setPacientes] = useState([])
    const [atendimentos, setAtendimentos] = useState([])

    const [qtdeRegistros, setQtderegistros] = useState(0);

    const navigation = useNavigation();
    const route = useRoute();
    const { hospitalId } = route.params as RouteParams; // o route.params não sabe qual é então foi criada a tipagem acima


    const handleLogout = Out();

    function handleNewOrder(hospitalId: string) {
        navigation.navigate('new', { hospitalId })
    }

    function handleOpenDetails(orderId: string, hospitalId: string) {
        navigation.navigate('details', { orderId, hospitalId })
    }

    function associaNome() {
        let arrTempAtend = [];
        atendimentos.map((atend) => {
            pacientes.map((pac) => {
                if (atend.paciente == pac.id) {
                    let temp = ({ ...atend, ...pac })
                    arrTempAtend.push(temp)
                    //console.log(arrTempAtend)
                }
            })
        })
        setOrders(arrTempAtend);
        setQtderegistros(arrTempAtend.length);

    }

    function getPacientes() {
        firestore().collection('PACIENTE')
            //.where('hospital', '==', hospitalId)
            .onSnapshot(snapshot => {
                const dataP = snapshot.docs.map(doc => {
                    const { nmPaciente, cpf } = doc.data();

                    return {
                        id: doc.id,
                        nmPaciente,
                        cpf
                    }
                });
                setPacientes(dataP);
                setIsLoading(false);
                //setQtderegistros(data.length);
            });
        //return pacient;        
    }

    function getAtendimentos(status: string) {
        firestore().collection('ATENDIMENTO')
            .where('hospital', '==', hospitalId)
            .where('status', '==', status)
            .orderBy('risco', 'desc')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => {
                    const { status, paciente, risco, created_at, closed_at } = doc.data();
                    console.log(statusSelected);                    
                    if (closed_at) {
                        let dataBd = closed_at ? closed_at.toDate().toString().substring(0, 9) : new Date().toDateString().substring(0, 9);
                        let dataAgora = new Date().toDateString().substring(0, 9);
                        /* console.log(dataBd === dataAgora);
                        console.log(dataBd);
                        console.log(dataAgora); */

                        if (status === "close" && dataBd != dataAgora) {
                            return {

                            }
                        }
                    }

                    return {
                        id_at: doc.id,
                        paciente,
                        risco,
                        status,
                        when: dateFormat(created_at)
                    }

                });
                //console.log(data);

                setAtendimentos(data);
                getPacientes();
                //setIsLoading(false);
                //setQtderegistros(data.length);
            }, ((error) => console.error(error)));
        return false;
    }

    useEffect(() => {
        console.log("UE" + statusSelected);
        setIsLoading(true);
        //console.log("atendimentos: " + atendimentos);
        //console.log("pacientes: " + pacientes);
        //console.log("orders: " + orders);
    }, [statusSelected]);

    //getAtendimentos
    useEffect(() => {
        getAtendimentos(statusSelected)
    }, [statusSelected]);
    //associaNome
    useEffect(() => {
        associaNome()
    }, [pacientes]);

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
                        Fila de atendimento
                    </Heading>
                    <Text fontSize={16} color="#fff">
                        {qtdeRegistros}
                    </Text>
                </HStack>

                <HStack space={3} mb={8}>
                    < Filter
                        type="open"
                        title="Aguardando"
                        onPress={() => setStatusSelected('open')}
                        isActive={statusSelected === 'open'}
                    />

                    < Filter
                        type="closed"
                        title="finalizado"
                        onPress={() => setStatusSelected('close')}
                        isActive={statusSelected === 'close'}
                    />

                </HStack>
                {
                    isLoading ? <Loading /> :
                        <FlatList
                            data={orders}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => <Order data={item} onPress={() => handleOpenDetails(item.id_at, hospitalId)} />}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            ListEmptyComponent={() => (
                                <Center>
                                    <Text color="#fff" fontSize="xl" mt={6} textAlign="center">
                                        0 Pacientes {'\n'}
                                        {statusSelected === 'open' ? 'aguardando atendimento' : 'liberados'}
                                    </Text>
                                </Center>
                            )}
                        />
                }

                <Button title="Novo Paciente" mb={5} onPress={() => handleNewOrder(hospitalId)} />
            </VStack>

        </VStack>
    );
}