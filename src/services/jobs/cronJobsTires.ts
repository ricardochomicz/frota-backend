import cron from 'node-cron';
import TiresService from '../TiresService';

cron.schedule('0 7 * * *', async () => {
    console.log('🔍 Verificando desgaste dos pneus...');
    await TiresService.checkTireWear();
});

console.log('🚀 Cron job para verificação de pneus iniciado.');
