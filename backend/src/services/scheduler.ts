import cron from 'node-cron';
import { syncFromExemploOutroSite } from './syncService';

/**
 * Configura o agendamento automático da sincronização
 * Executa a cada 5 minutos
 */
export function startScheduler() {
  // Validar se o agendamento deve ser ativado
  const ENABLE_SCHEDULER = process.env.ENABLE_SYNC_SCHEDULER === 'true';
  
  console.log(`[scheduler] ENABLE_SYNC_SCHEDULER = ${process.env.ENABLE_SYNC_SCHEDULER}`);
  console.log(`[scheduler] Agendador ${ENABLE_SCHEDULER ? 'HABILITADO' : 'DESABILITADO'}`);
  
  if (!ENABLE_SCHEDULER) {
    console.log('[scheduler] Configure ENABLE_SYNC_SCHEDULER=true para ativar o agendador automático.');
    return;
  }

  // Executar a cada 5 minutos: */5 * * * *
  // Formato: minuto hora dia mês dia-da-semana
  const cronExpression = '*/5 * * * *';

  cron.schedule(cronExpression, async () => {
    console.log(`[scheduler] Iniciando sincronização agendada - ${new Date().toISOString()}`);
    try {
      await syncFromExemploOutroSite();
      console.log(`[scheduler] Sincronização concluída - ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[scheduler] Erro na sincronização agendada:', error);
    }
  });

  console.log(`[scheduler] Agendador iniciado: sincronização a cada 5 minutos`);
}
