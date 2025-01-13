import healthCheck from './healthCheck';
import UpdateLocation from '../scripts/updateLocation';

export default function OnStart() {
    //Process health check
    const processHealthCheck = async () => {
        try {
            console.log('Starting health check');
            await healthCheck().checkNetworkAccess();
            await healthCheck().checkLocationAccess();
            await healthCheck().checkNetworkStatus();
            await healthCheck().checkLocationStatus();
            await healthCheck().checkAccountName();

            //set location update and run in background
            console.log('Starting location update');
            UpdateLocation().getSelfLocation();
            const intervalId = setInterval(() => {
                UpdateLocation().getOtherLocation();
            }, 5000);
            
        } catch (e) {
            console.error('Health check failed', e);
        }
    }
}