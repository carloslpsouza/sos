import { ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Heading, HStack, IconButton, KeyboardAvoidingView, useTheme, VStack, Text, Center } from 'native-base';
import { Buildings, FirstAid, ListChecks, MapPinLine, Notepad, PersonSimpleRun, SignOut, Truck } from 'phosphor-react-native';
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
import { atualizaDados, getInfo, transfereHospital } from '../utils/crud'
import { dateFormat } from '../utils/firestoreDateFormats';
import { OcorrenciaProps, VitimasProps } from '../componentes/CardOcorrencia';
import { HospitalProps } from '../componentes/Hospital';

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
  const [NMHospital, setNMHhospital] = useState([]);


  const handleLogout = Out();

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
          hospital: data.hospital,
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
        getInfo('HOSPITAL', dt.hospital, 'getNMHospital')
          .then((dt: HospitalProps) => {
            console.log(dt.nm_hospital)
            setNMHhospital([dt.nm_hospital])
          })
        setIsLoading(false);
      });

  }, []);

  useEffect(() => {
    console.log("exibeComponentes: ")
    console.log(exibeComponentes);
  }, [exibeComponentes]);

  return (
    <VStack flex={1} pb={1} bg={especColors.coresPadrao.bg0}>
      <HStack pt={1} pb={1} w="full" justifyContent="space-between" alignItems="center" bg={especColors.coresPadrao.head0}>
        <Logo />
        <IconButton
          icon={<SignOut size={26} color={colors.black} />}
          onPress={handleLogout}
        />
      </HStack>
      {
        isLoading ? <Loading /> :
          <VStack flex={1} px={2}>
            <Heading fontSize={16} my={5} color={especColors.coresPadrao.textCard1} textAlign="center">
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
                    <VStack
                      flex={1}
                      px={2}
                      m={1}
                      rounded="sm"
                      shadow={'9'}
                      bg={especColors.coresPadrao.bg1}
                    >
                      <VStack>
                        <HStack mb={3}>
                          <ListChecks size={26} color={especColors.coresPadrao.textCard1} />
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md">Checkpoints da ocorrência</Text>
                        </HStack>
                        <HStack mb={3}>
                          <PersonSimpleRun size={26} color={especColors.coresPadrao.textCard1} />
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md" textAlign={'justify'}>Saída Base: {item.dt_saida_base}</Text>
                        </HStack>
                        <HStack mb={3}>
                          <MapPinLine size={26} color={especColors.coresPadrao.textCard1} />
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md">Chegada local: {item.dt_chegada_local}</Text>
                        </HStack>
                      </VStack>
                      {
                        item.dt_saida_local != undefined &&
                        <HStack mb={3}>
                          <Truck size={26} color={especColors.coresPadrao.textCard1} />
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md">Saída ocorrência: {item.dt_saida_local}</Text>
                        </HStack>
                      }{
                        item.dt_chegada_hospital != undefined &&
                        <HStack mb={3}>
                          <Buildings size={26} color={especColors.coresPadrao.textCard1} />
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md">Chegada hospital: {item.dt_chegada_hospital}</Text>
                        </HStack>
                      }{
                        item.dt_saida_hospital != undefined &&
                        <HStack mb={3}>
                          <Truck size={26} color={especColors.coresPadrao.textCard1} mirrored/>
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md">Saída hospital: {item.dt_saida_hospital}</Text>
                        </HStack>
                      }{
                        item.dt_retorno_base != undefined &&
                        <HStack mb={3}>
                          <Buildings size={26} color={especColors.coresPadrao.textCard1} />
                          <Text ml={2} color={especColors.coresPadrao.textCard1} fontSize="md">Retorno à base: {item.dt_retorno_base}</Text>
                        </HStack>
                      }
                    </VStack>
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
                <VStack>
                  <VStack py={2} borderTopColor={especColors.coresPadrao.textCard1} borderTopWidth={'1'}>
                    <Text color={especColors.coresPadrao.textCard1} fontSize="md" textAlign='left'>
                      <Notepad size={18} color={especColors.coresPadrao.textCard1} /> Ocorrência:
                    </Text>
                    <Text m={2} w={'full'} color={especColors.coresPadrao.textCard1} fontSize="md" textAlign='justify'>
                      {vetorOcorrencias[0] && vetorOcorrencias[0].ocorrencia}
                    </Text>
                  </VStack>
                  <VStack
                    flex={1}
                    px={2}
                    m={1}
                    rounded="sm"
                    shadow={'9'}
                    bg={especColors.coresPadrao.bg1}
                  >
                    <Text ml={0} mr={1} my={2} w={'full'} borderRadius={5} color={especColors.coresPadrao.textCard1} fontSize="md" textAlign='left'>
                      <Buildings size={18} color={especColors.coresPadrao.textCard1} /> Hospital:  {NMHospital}
                    </Text>
                  </VStack>
                  <VStack py={2} borderTopColor={especColors.coresPadrao.textCard1} borderTopWidth={'1'}>
                    <Text ml={0} mr={1} my={2} w={'full'} borderRadius={5} color={especColors.coresPadrao.textCard1} fontSize="md" textAlign='left'>
                      <FirstAid size={18} color={especColors.coresPadrao.textCard1} /> Vítimas:
                    </Text>
                    <FlatList
                      mx={2}
                      shadow={'10'}
                      data={vetorVitimas[0]}
                      renderItem={({ item }) => <Order data={item} onPress={() => null} />}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 10 }}
                      ListEmptyComponent={() => (
                        <Center>
                          <Text color="#fff" fontSize="xl" mt={6} textAlign="center">
                            0 Pacientes {'\n'}

                          </Text>
                        </Center>
                      )}
                    />
                  </VStack>
                </VStack>
              </ScrollView>

            </KeyboardAvoidingView>
          </VStack>
      }
    </VStack>
  );
}