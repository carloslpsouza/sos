import { ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Heading, HStack, IconButton, KeyboardAvoidingView, useTheme, VStack, Text, Center } from 'native-base';
import { Buildings, FirstAid, MapPinLine, Notepad, PersonSimpleRun, SignOut, Truck } from 'phosphor-react-native';
import { useNavigation, useRoute } from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore';

//Componentes
import { Button } from '../componentes/Button';
import { Loading } from '../componentes/Loading';
import { Order } from '../componentes/Order';

//Estilos e animações
import Logo from '../assets/Logo.svg';
import { especColors } from "../styles/especColors"

//Regra de negócio
import { Out } from '../utils/Out';
import { atualizaDados, transfereHospital } from '../utils/crud'
import { dateFormat } from '../utils/firestoreDateFormats';
import { OcorrenciaProps, VitimasProps } from '../componentes/CardOcorrencia';

type RouteParams = { // Essa tipagem foi criada apenas para que o auto complite pudesse achar esse paramentro (Testar sem)
  idOcorrencia?: string,
  hospitalId?: string
}

export function Ocorrencia() {
  //Estilização & efeitos
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const [titulo, setTitulo] = useState('VIATURA OU EQUIPE: ')
  const [exibeComponentes, setExibeComponentes] = useState([1, 0, 0, 0, 0])

  //Navegação entre páginas
  const navigation = useNavigation();
  const route = useRoute();

  //informações vindas de Home.tsx
  const { idOcorrencia, hospitalId } = route.params as RouteParams;

  //Dados regra de negócio
  const [vetorOcorrencias, setVetorOcorrencias] = useState([]);
  const [vetorVitimas, setVetorVitimas] = useState([]);

  const handleLogout = Out();

  const navegarHome = () => {
    navigation.navigate('home');
  }

  function timeStamp(ts: {}, altComp: number) {
    setIsLoading(true);
    if (altComp == 0) {
      setExibeComponentes([0, 1, 0, 0, 0]);
    } if (altComp == 1) {
      setExibeComponentes([0, 0, 1, 0, 0]);
    } if (altComp == 2) {
      setExibeComponentes([0, 0, 0, 1, 0]);
    } if (altComp == 3) {
      setExibeComponentes([0, 0, 0, 0, 1]);
    }

    atualizaDados(idOcorrencia, ts, 'timeStamp()', 'IniciaOcorrencia')
      .then((data: boolean) => {
        if (data) {
          setIsLoading(false);
        }
      })
  }
  useEffect(() => {
    console.log('================ > Ocorrencia.tsx - useEffect');
  }, []);

  useEffect(() => {
    setIsLoading(true);
    console.log(idOcorrencia);
    firestore().collection('OCORRENCIA').doc(idOcorrencia)
      .onSnapshot((doc) => {
        const data = doc.data();
        const dt: OcorrenciaProps = {
          vtr: data.vtr,
          userLocal: data.userLocal,
          ocorrencia: data.ocorrencia,
          dt_saida_base: dateFormat(data.ts_saida_base),
          dt_chegada_local: dateFormat(data.ts_chegada_local),
          dt_saida_local: dateFormat(data.ts_saida_local),
          dt_chegada_hospital: dateFormat(data.ts_chegada_hospital),
          dt_saida_hospital: dateFormat(data.ts_saida_hospital),
          dt_retorno_base: dateFormat(data.ts_retorno_base),
          vetorVitimas: data.vetorVitimas
        }
        setVetorOcorrencias([dt]);
        setVetorVitimas([dt.vetorVitimas]);
        setIsLoading(false);
      });

  }, []);

  useEffect(() => {
    console.log("exibeComponentes: ")
    console.log(exibeComponentes);
  }, [exibeComponentes]);

  return (
    <VStack flex={1} pb={1} bg="#565656">
      <HStack w="full" justifyContent="space-between" alignItems="center" bg="#FFFAF0" pt={1} pb={1} px={2}>
        <Logo />
        <IconButton
          icon={<SignOut size={26} color={colors.black} />}
          onPress={handleLogout}
        />
      </HStack>
      {
        isLoading ? <Loading /> :
          <VStack flex={1} px={6} alignItems="center">
            <Heading fontSize={16} mt={5} color="#fff">
              {titulo} {vetorOcorrencias[0] ? vetorOcorrencias[0].vtr.toString().toUpperCase() : <Loading />}
            </Heading>
            <KeyboardAvoidingView
              behavior="height"
              style={{ flex: 1 }}
              bg={especColors.coresPadrao.bg0}
            >
              <ScrollView>
                <FlatList
                  data={vetorOcorrencias}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <>
                      <VStack flex={1}
                        bg="#FFFAF0"
                        mt={2}
                        mb={2}
                        height={16}
                        alignItems="center"
                        justifyContent="space-between"
                        rounded="sm"
                        overflow="hidden">
                        <HStack p={5} pl={2}>
                          <PersonSimpleRun size={26} color={colors.black} />
                          <Text color="black" fontSize="md">Saída Base: {item.dt_saida_base}</Text>
                        </HStack>
                      </VStack>
                      <VStack flex={1}
                        bg="#FFFAF0"
                        mt={2}
                        mb={2}
                        height={16}
                        alignItems="center"
                        justifyContent="space-between"
                        rounded="sm"
                        overflow="hidden">
                        <HStack p={5} pl={2}>
                          <MapPinLine size={26} color={colors.black} />
                          <Text color="black" fontSize="md">Chegada local: {item.dt_chegada_local}</Text>
                        </HStack>
                      </VStack>
                      {
                        item.dt_saida_local != undefined &&
                        <VStack flex={1}
                          bg="#FFFAF0"
                          mt={2}
                          mb={2}
                          height={16}
                          alignItems="center"
                          justifyContent="space-between"
                          rounded="sm"
                          overflow="hidden">
                          <HStack p={5} pl={2}>
                            <Truck size={26} color={colors.black} />
                            <Text color="black" fontSize="md">Saída ocorrência: {item.dt_saida_local}</Text>
                          </HStack>
                        </VStack>
                      }{
                        item.dt_chegada_hospital != undefined &&
                        <VStack flex={1}
                          bg="#FFFAF0"
                          mt={2}
                          mb={2}
                          height={16}
                          alignItems="center"
                          justifyContent="space-between"
                          rounded="sm"
                          overflow="hidden">
                          <HStack p={5} pl={1}>
                            <Buildings size={26} color={colors.black} />
                            <Text color="black" fontSize="md">Chegada hospital: {item.dt_chegada_hospital}</Text>
                          </HStack>
                        </VStack>
                      }{
                        item.dt_saida_hospital != undefined &&
                        <VStack flex={1}
                          bg="#FFFAF0"
                          mt={2}
                          mb={2}
                          height={16}
                          alignItems="center"
                          justifyContent="space-between"
                          rounded="sm"
                          overflow="hidden">
                          <HStack p={5} pl={1}>
                            <Buildings size={26} color={colors.black} />
                            <Text color="black" fontSize="md">Saída hospital: {item.dt_saida_hospital}</Text>
                          </HStack>
                        </VStack>
                      }{
                        item.dt_retorno_base != undefined &&
                        <VStack flex={1}
                          bg="#FFFAF0"
                          mt={2}
                          mb={2}
                          height={16}
                          alignItems="center"
                          justifyContent="space-between"
                          rounded="sm"
                          overflow="hidden">
                          <HStack p={5} pl={1}>
                            <Buildings size={26} color={colors.black} />
                            <Text color="black" fontSize="md">Retorno à base: {item.dt_retorno_base}</Text>
                          </HStack>
                        </VStack>
                      }
                    </>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  ListEmptyComponent={() => (
                    <Center>
                      <Text color="#fff" fontSize="xl" mt={6} textAlign="center">
                        {'\n'}
                      </Text>
                    </Center>
                  )}
                />
                <VStack mt={1} mb={4} borderTopColor={colors.white} borderTopWidth={0.5}>
                  <Text ml={2} mr={2} mt={2} w={'full'} color='white' fontSize="md" textAlign='left'><Notepad size={20} color='white' />Ocorrência: </Text>
                  <Text ml={2} mr={2} w={'full'} color='white' fontSize="md" textAlign='justify'>{vetorOcorrencias[0] && vetorOcorrencias[0].ocorrencia}</Text>
                </VStack>

                <VStack mt={1} mb={4} borderTopColor={colors.white} borderTopWidth={0.5}>
                  <Text ml={2} mr={2} my={2} w={'full'} color='white' fontSize="md" textAlign='left'>
                    <FirstAid size={18} color='white' />Vítimas:
                  </Text>
                  <FlatList
                    data={vetorVitimas[0]}
                    renderItem={({ item }) => <Order data={item} onPress={() => null} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    ListEmptyComponent={() => (
                      <Center>
                        <Text color="#fff" fontSize="xl" mt={6} textAlign="center">
                          0 Pacientes {'\n'}

                        </Text>
                      </Center>
                    )}
                  />
                </VStack>
              </ScrollView>

            </KeyboardAvoidingView>
          </VStack>
      }
    </VStack>
  );
}