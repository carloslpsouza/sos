import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SelectHospital } from '../screens/SelectHospital';
import { Home } from '../screens/Home';
import { Ocorrencia } from '../screens/Ocorrencia';
import { IncluiVitima } from '../screens/IncluiVitima';
import { Details } from '../screens/Details';
import { Register } from '../screens/Register';

const { Navigator, Screen} =  createNativeStackNavigator();

export function AppRoutes(){
    return(
        <Navigator screenOptions={{ headerShown:false }}>
            <Screen name="home" component={Home} />
            <Screen name="ocorrencia" component={Ocorrencia} />
            <Screen name="incluiVitima" component={IncluiVitima} />
            <Screen name="new" component={Register} />
            <Screen name="details" component={Details} />
            <Screen name="SelectHospital" component={SelectHospital} />            
        </Navigator>
    )
}