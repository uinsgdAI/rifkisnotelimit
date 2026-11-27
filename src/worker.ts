import {
  handleApiRequest,
  type WorkerApiEnv,
  type WorkerExecutionContext,
} from './utils/workerApi';

interface AssetsFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface WorkerEnv extends WorkerApiEnv {
  ASSETS: AssetsFetcher;
}

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    ctx: WorkerExecutionContext
  ): Promise<Response> {
    const apiResponse = await handleApiRequest(request, fetch, env, ctx);
    if (apiResponse) {
      return apiResponse;
    }
    return env.ASSETS.fetch(request);
  },
};
