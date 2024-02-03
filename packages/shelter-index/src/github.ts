type RepositoryDeployments = {
  nodes: RepositoryDeploymentNode[];
};
type RepositoryDeploymentNode = {
  state: "ACTIVE" | unknown;
  latestStatus: {
    state: "SUCCESS" | unknown;
    environmentUrl: string | null;
  };
};
type RepositoryObject = {
  entries: RepositoryObjectEntry[];
};
type RepositoryObjectEntry = {
  name: string;
  type: "tree" | string;
};
type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};
type ResultType = {
  data: {
    search: {
      nodes: {
        nameWithOwner: string;
        deployments: RepositoryDeployments;
        object: RepositoryObject | null;
      }[];
      pageInfo: PageInfo;
    };
  };
};

const gql = String.raw;
const query = gql`query {
	search(query: "shelter-plugins", type: REPOSITORY, first: 100) {
		nodes {
			... on Repository {
				nameWithOwner
				deployments(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
					nodes {
						state
						latestStatus {
							state
							environmentUrl
						}
					}
				}
				object(expression: "HEAD:plugins") {
					... on Tree {
						entries {
							name
							type
						}
					}
				}
			}
		}
		pageInfo {
			hasNextPage
			endCursor
		}
	}
}`;

const getEnvironmentUrl = (deployments: RepositoryDeployments) =>
  deployments.nodes.find((d) => d.state === "ACTIVE")?.latestStatus.environmentUrl;

const getPlugins = (object: RepositoryObject) => object.entries.filter((e) => e.type === "tree").map((t) => t.name);

async function searchRepositories(token: string) {
  const req = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "shelter/plugin-scraper",
    },
    body: JSON.stringify({ query }),
  });
  if (!req.ok) throw new Error(`non-ok response status ${req.status}`);
  return req.json() as Promise<ResultType>;
}

export type PluginManifest = {
  name: string;
  author: string;
  description: string;
  hash?: string;
};
export type RepositoryData = {
  name: string;
  url: string;
  plugins: PluginManifest[];
};
export type RepositoryMap = Map<string, RepositoryData>;
export async function fetchPluginMap(token: string): Promise<RepositoryMap> {
  const result: RepositoryMap = new Map();
  const search = await searchRepositories(token);
  for (const repository of search.data.search.nodes) {
    const url = getEnvironmentUrl(repository.deployments);
    if (!url || repository.object == null) continue;
    const plugins = getPlugins(repository.object);

    let manifests: PluginManifest[];
    try {
      const promises = plugins.map((plugin) =>
        fetch(`${url}${plugin}/plugin.json`).then((r) => r.json() as Promise<PluginManifest>),
      );
      manifests = await Promise.all(promises);
    } catch {
      continue;
    }

    if (manifests.length < 1) continue;

    result.set(repository.nameWithOwner, {
      name: repository.nameWithOwner,
      url,
      plugins: manifests,
    });
  }
  return result;
}
