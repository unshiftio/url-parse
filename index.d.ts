declare module "url-parse" {
    interface Query {
        [index: string]: string;
    }

    interface QueryParser {
        (query: string): any;
    }

    interface ParsedUrl {
        (url: string, baseURL?: string, parseQuery?: boolean|QueryParser): ParsedUrl;
        new (url: string, baseURL?: string, parseQuery?: boolean|QueryParser): ParsedUrl;

        protocol: string;   // protocol: Requested protocol without slashes (e.g. http:).
        username: string;   // username: Username of basic authentication.
        password: string;   // password: Password of basic authentication.
        auth: string;       // auth: Authentication information portion (e.g. username:password).
        host: string;       // host: Host name with port number.
        hostname: string;   // hostname: Host name without port number.
        port: string;       // port: Optional port number.
        pathname: string;   // pathname: URL path.
        query: Query;       // query: Parsed object containing query string, unless parsing is set to false.
        hash: string;       // hash: The "fragment" portion of the URL including the pound-sign (#).
        href: string;       // href: The full URL.

        toString(): string;
        set(key: string, value: string|Object|number): ParsedUrl;
    }

    const URL: ParsedUrl;

    export = URL;
}
