import { Request, Response } from "express";
import axios from "axios";

const GITHUB_API_BASE_URL = "https://api.github.com";

const getRepoCode = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  try {
    const files = await getAllFiles(owner, repo, "");
    res.json(files);
  } catch (error: any) {
    res.status(500).send(error.toString());
  }
};

const getAllFiles = async (owner: string, repo: string, path: string) => {
  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${path}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });

  const files: any[] = [];
  for (const item of response.data) {
    if (item.type === "file") {
      files.push({
        path: item.path,
        download_url: item.download_url,
      });
    } else if (item.type === "dir") {
      const nestedFiles: any[] = await getAllFiles(owner, repo, item.path);
      files.push(...nestedFiles);
    }
  }

  return files;
};

const getBranches = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).send(error.toString());
  }
};

const getPullRequests = async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).send(error.toString());
  }
};

const readFileContent = async (req: Request, res: Response) => {
  const { owner, repo, path } = req.params;
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3.raw",
        },
      }
    );
    res.send(response.data);
  } catch (error: any) {
    res.status(500).send(error.toString());
  }
};

const downloadRepoAsZip = async (req: Request, res: Response) => {
  const { owner, repo, branch } = req.params;
  const archiveUrl = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/zipball/${branch}`;

  try {
    const response = await axios({
      url: archiveUrl,
      method: "GET",
      responseType: "stream",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${repo}-${branch}.zip`
    );
    res.setHeader("Content-Type", "application/zip");

    response.data.pipe(res);
  } catch (error: any) {
    res.status(500).send(error.toString());
  }
};

export {
  getRepoCode,
  getBranches,
  getPullRequests,
  readFileContent,
  downloadRepoAsZip,
};
