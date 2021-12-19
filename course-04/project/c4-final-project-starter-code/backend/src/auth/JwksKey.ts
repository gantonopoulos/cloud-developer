export interface JwksKey{
    alg: string,
    kty: string,
    use: string,
    x5c: string,
    e: string,
    n: string,
    kid: string,
    x5t: string
}

export interface JwksSigningKey
{
    kid: string,
    publicKey: string
}