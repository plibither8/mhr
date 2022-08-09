const namespaces: Record<string, KVNamespace> = {
  MHR: undefined,
};

export const setNamepace = (name: string, namespace: KVNamespace) => {
  namespaces[name] = namespace;
};

export default namespaces;
