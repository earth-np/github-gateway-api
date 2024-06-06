import { Router } from 'express';
import { getRepoCode, getBranches, getPullRequests, readFileContent, downloadRepoAsZip } from './controllers/githubController';

const router = Router();

router.get('/repo/:owner/:repo/code', getRepoCode);
router.get('/repo/:owner/:repo/branches', getBranches);
router.get('/repo/:owner/:repo/pulls', getPullRequests);
router.get('/repo/:owner/:repo/code/:path', readFileContent);
router.get('/repo/:owner/:repo/download/:branch', downloadRepoAsZip);

export default router;
