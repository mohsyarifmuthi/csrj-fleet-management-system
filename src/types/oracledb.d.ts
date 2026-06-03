declare module 'oracledb' {
  export interface ConnectionAttributes {
    user?: string;
    password?: string;
    connectString?: string;
    privilege?: number;
    externalAuth?: boolean;
    stmtCacheSize?: number;
  }

  export interface Connection {
    execute<T = any>(
      sql: string,
      binds?: Record<string, any> | any[],
      options?: ExecuteOptions
    ): Promise<Result<T>>;
    close(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    break(): Promise<void>;
    changePassword(newPassword: string): Promise<void>;
    createLob(type: number): Promise<Lob>;
    getStatementInfo(sql: string): Promise<StatementInfo>;
    ping(): Promise<void>;
    queryStream<T = any>(sql: string, binds?: any, options?: ExecuteOptions): any;
  }

  export interface ExecuteOptions {
    autoCommit?: boolean;
    batchErrors?: boolean;
    bindDefs?: any;
    extendedMetaData?: boolean;
    fetchArraySize?: number;
    fetchTypeHandler?: (metaData: any) => any;
    keepInStmtCache?: boolean;
    maxRows?: number;
    outFormat?: number;
    prefetchRows?: number;
    resultSet?: boolean;
  }

  export interface Result<T = any> {
    rows?: T[];
    rowsAffected?: number;
    metaData?: any[];
    outBinds?: any;
    resultSet?: ResultSet<T>;
  }

  export interface ResultSet<T = any> {
    getRow(): Promise<T>;
    getRows(numRows: number): Promise<T[]>;
    close(): Promise<void>;
  }

  export interface Lob {
    type: number;
    chunkSize: number;
    length: number;
    pieceSize: number;
    offset: number;
    close(): Promise<void>;
    getData(): Promise<string | Buffer>;
    setPieceSize(size: number): void;
    write(data: string | Buffer): Promise<void>;
  }

  export interface StatementInfo {
    statementType: number;
    bindNames: string[];
    isPLSQL: boolean;
    isReturning: boolean;
  }

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(): Promise<void>;
    connectionsOpen: number;
    connectionsInUse: number;
    poolMin: number;
    poolMax: number;
    poolIncrement: number;
    poolTimeout: number;
    stmtCacheSize: number;
    status: number;
  }

  export interface PoolAttributes extends ConnectionAttributes {
    poolMin?: number;
    poolMax?: number;
    poolIncrement?: number;
    poolTimeout?: number;
    queueTimeout?: number;
    stmtCacheSize?: number;
    homogeneous?: boolean;
    reuseConnections?: boolean;
  }

  export function getConnection(config: ConnectionAttributes): Promise<Connection>;
  export function createPool(config: PoolAttributes): Promise<Pool>;
  export function getPool(poolName?: string): Pool;

  export const OUT_FORMAT_OBJECT: number;
  export const OUT_FORMAT_ARRAY: number;
  export const BIND_OUT: number;
  export const BIND_IN: number;
  export const BIND_INOUT: number;
  export const STRING: number;
  export const NUMBER: number;
  export const DATE: number;
  export const CURSOR: number;
  export const BUFFER: number;
  export const CLOB: number;
  export const BLOB: number;
  export const SYSDBA: number;
  export const SYSOPER: number;
  export const SYSASM: number;
  export const SYSBACKUP: number;
  export const SYSDG: number;
  export const SYSKM: number;
  export const SYSRAC: number;
  export const AUTH_MODE_DEFAULT: number;
  export const AUTH_MODE_PRELIM: number;
  export const POOL_STATUS_OPEN: number;
  export const POOL_STATUS_CLOSED: number;
  export const DB_TYPE_VARCHAR: number;
  export const DB_TYPE_NUMBER: number;
  export const DB_TYPE_DATE: number;
  export const DB_TYPE_TIMESTAMP: number;
  export const DB_TYPE_TIMESTAMP_TZ: number;
  export const DB_TYPE_TIMESTAMP_LTZ: number;
  export const DB_TYPE_RAW: number;
  export const DB_TYPE_CLOB: number;
  export const DB_TYPE_BLOB: number;
  export const DB_TYPE_LONG: number;
  export const DB_TYPE_LONG_RAW: number;
  export const DB_TYPE_CHAR: number;
  export const DB_TYPE_BINARY_FLOAT: number;
  export const DB_TYPE_BINARY_DOUBLE: number;
  export const DB_TYPE_ROWID: number;
  export const DB_TYPE_NCLOB: number;
  export const DB_TYPE_NVARCHAR: number;
  export const DB_TYPE_NCHAR: number;
  export const STMT_TYPE_UNKNOWN: number;
  export const STMT_TYPE_SELECT: number;
  export const STMT_TYPE_UPDATE: number;
  export const STMT_TYPE_DELETE: number;
  export const STMT_TYPE_INSERT: number;
  export const STMT_TYPE_CREATE: number;
  export const STMT_TYPE_DROP: number;
  export const STMT_TYPE_ALTER: number;
  export const STMT_TYPE_BEGIN: number;
  export const STMT_TYPE_DECLARE: number;
  export const STMT_TYPE_CALL: number;
  export const STMT_TYPE_EXPLAIN_PLAN: number;
  export const STMT_TYPE_MERGE: number;
  export const STMT_TYPE_ROLLBACK: number;
  export const STMT_TYPE_COMMIT: number;
  export const SODA_COLL_MAP_MODE: number;
  export const AQ_DEQ_WAIT_FOREVER: number;
  export const AQ_DEQ_NO_WAIT: number;
  export const AQ_DEQ_WAIT_NEXT_MSG: number;
  export const AQ_MSG_DELIV_MODE_PERSISTENT: number;
  export const AQ_MSG_DELIV_MODE_BUFFERED: number;
  export const AQ_MSG_STATE_WAITING: number;
  export const AQ_MSG_STATE_READY: number;
  export const AQ_MSG_STATE_PROCESSED: number;
  export const AQ_MSG_STATE_EXPIRED: number;
  export const AQ_VISIBILITY_IMMEDIATE: number;
  export const AQ_VISIBILITY_ON_COMMIT: number;
  export const AQ_NTFN_GROUPING_BY_TIME: number;
  export const AQ_NTFN_GROUPING_BY_TRANSACTION: number;
  export const AQ_NTFN_GROUPING_TYPE_SUMMARY: number;
  export const AQ_NTFN_GROUPING_TYPE_LAST: number;
  export const AQ_NTFN_GROUPING_TYPE_FIRST: number;
  export const AQ_NTFN_QOS_RELIABLE: number;
  export const AQ_NTFN_QOS_PAYLOAD: number;
  export const AQ_NTFN_QOS_PURGE_ON_NTFN: number;
  export const TPC_BEGIN_JOIN: number;
  export const TPC_BEGIN_RESUME: number;
  export const TPC_BEGIN_PROMOTE: number;
  export const TPC_END_NORMAL: number;
  export const TPC_END_SUSPEND: number;
  export const TPC_END_DETACH: number;
  export const TPC_ORA_OK: number;
  export const TPC_ORA_READONLY: number;
  export const TPC_ORA_OTHER: number;
  export const TPC_ORA_RBCOMMIT: number;
  export const TPC_ORA_RBROLLBACK: number;
  export const TPC_ORA_HEURCOM: number;
  export const TPC_ORA_HEURRB: number;
  export const TPC_ORA_HEURMIX: number;
  export const TPC_ORA_RMERR: number;
  export const TPC_ORA_NOTA: number;
  export const TPC_ORA_INFLUX: number;
  export const TPC_ORA_COMMITTED: number;
  export const TPC_ORA_RBONLY: number;
  export const TPC_ORA_UNKNOWN: number;
  export const TPC_ORA_NO_RESUME: number;
  export const TPC_ORA_MAXNAME: number;
  export const TPC_ORA_NOLAZY: number;
}