import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/core';

const headers = {
  'X-GitHub-Api-Version': '2022-11-28',
};

@Injectable()
export class GithubService {
  private octokit;

  constructor(private configService: ConfigService) {
    this.octokit = new Octokit({
      auth: this.configService.get('github.auth'),
    });
  }

  async getUserByUsername(username: string) {
    return this.octokit.request('GET /users/{username}', {
      username,
      headers,
    });
  }
}
