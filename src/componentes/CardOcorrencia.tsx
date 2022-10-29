import { Box, Circle, HStack, Text, useTheme, VStack, Pressable, IPressableProps } from 'native-base';
import { ClockAfternoon, Hourglass, CircleWavyCheck, FirstAid } from 'phosphor-react-native';
import { especColors } from "../styles/especColors"
import { msg } from "../utils/mensagensPadrao"

export type VitimasProps = {
  nmPaciente: string,
  cpf?: string,
  telefone?: string,
  risco: number
}

export type OcorrenciaProps = {
  id?: string;
  vtr: string;
  userLocal?: string;
  ocorrencia?: string;
  hospital?: string;
  dt_saida_base?: string;
  dt_chegada_local?: string;
  dt_saida_local?: string;
  dt_chegada_hospital?: string;
  dt_saida_hospital?: string;
  dt_retorno_base?: string;
  vetorVitimas?: VitimasProps[];
}

type Props = IPressableProps & {
  data: OcorrenciaProps;
}

export function Ocorrencia({ data, ...rest }: Props) {
  const { colors } = useTheme();

  return (
    <>
      {
        data.vetorVitimas &&
        <Pressable {...rest}>
          <HStack
            bg={especColors.coresPadrao.card0}
            shadow={'9'}
            m={2}
            alignItems="center"
            justifyContent="space-between"
            rounded="sm"
            overflow="hidden"
          >
            <VStack flex={1} px={1.5} my={3} >
              <Text color={especColors.coresPadrao.textCard0} fontSize="md">
                VTR: {data.vtr}
              </Text>
              <Text color={especColors.coresPadrao.textCard0} fontSize="md">
                Chegada ao Local: {data.dt_chegada_local}
              </Text>
              {
                data.dt_chegada_hospital &&
                <HStack alignItems="center">
                  <ClockAfternoon size={15} color={especColors.coresPadrao.textCard0} />
                  <Text color={especColors.coresPadrao.textCard0} fontSize="xs" ml={1}>
                    Chegada hospital: {data.dt_chegada_hospital}
                  </Text>
                </HStack>
              }
              <HStack alignItems="center">
                <ClockAfternoon size={15} color={especColors.coresPadrao.textCard0} />
                <Text color={especColors.coresPadrao.textCard0} fontSize="xs" ml={1}>
                  Saída base: {data.dt_saida_base}
                </Text>
              </HStack>
              <HStack alignItems="center">
                <HStack>
                  <FirstAid size={15} color={especColors.coresPadrao.textCard0} />
                  <Text color={especColors.coresPadrao.textCard0} fontSize="xs" ml={1}>
                    Vítimas: {data.vetorVitimas.length}
                  </Text>
                </HStack>
                <HStack ml={5}>
                  <ClockAfternoon size={15} color={especColors.coresPadrao.textCard0} />
                  <Text color={especColors.coresPadrao.textCard0} fontSize="xs" ml={1}>
                    Status: {data.dt_retorno_base ? 'Encerrado' : 'Em andamento'}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>
        </Pressable>
      }
    </>
  );
}