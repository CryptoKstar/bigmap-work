import Principal "mo:base/Principal";
import TrieMap "mo:base/TrieMap";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Bool "mo:base/Bool";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Hash "mo:base/Hash";
import Trie "mo:base/Trie";

module {
  
  public type UserId = Principal;
  public type UserName = Text;
  public type FileId = Text; // chosen by createFile
  public type ChunkId = Text; // FileId # (toText(ChunkNum))
  public type ChunkData = Blob; // encoded as ??
  public type Map<X, Y> = TrieMap.TrieMap<X, Y>;
  public type Timestamp =Int;
  public type StreamingCallbackToken = {
    key : Text;
    content_encoding : Text;
    index : Nat; //starts at 1
    sha256: ?[Nat8];
  };

  public type FileData = {
    fileId : FileId;
    userName : Text;
    uploadedAt : Timestamp;
    createdAt : Timestamp;
    chunkCount: Nat;    
    name: Text;
    size: Nat;
    filetype: Text;
  };

  public type StreamingCallbackHttpResponse = {
    body : Blob;
    token : ?StreamingCallbackToken;
  };

  public type StreamingCallback = query StreamingCallbackToken  -> async StreamingCallbackHttpResponse;

  public type StreamingStrategy = {
    #Callback: {
      token : StreamingCallbackToken;
      callback : StreamingCallback
    }
  };

  public type HttpRequest = {
    method: Text;
    url: Text;
    headers: [(Text, Text)];
    body: Blob;
  };

  public type HttpResponse = {
    status_code: Nat16;
    headers: [(Text, Text)];
    body: Blob;
    streaming_strategy : ?StreamingStrategy;
  };

  public type FileInit = {
    name: Text;
    chunkCount: Nat;
    fileSize: Nat;
    mimeType: Text;
    thumbnail: Text;
    marked: Bool;
    sharedWith: [UserName];
    folder: Text;
  };

  public type FileInfo = {
    fileId : FileId;
    userName: UserName;
    createdAt : Int;
    name: Text;
    chunkCount: Nat;
    fileSize: Nat;
    mimeType: Text;
    marked: Bool;
    sharedWith: [UserName];
    madePublic: Bool;
    fileHash: Text;
  };

  public type FileInfo2 = {
    fileId : FileId;
    userName: UserName;
    createdAt : Int;
    name: Text;
    chunkCount: Nat;
    fileSize: Nat;
    mimeType: Text;
    thumbnail: Text;
    marked: Bool;
    sharedWith: [UserName];
    madePublic: Bool;
    fileHash: Text;
    folder: Text;
  };

  public type State = {
    /// all files.
    files : Map<FileId, FileInfo>;
    /// all chunks.
    chunks : Map<ChunkId, ChunkData>;

    /// all files.
    files2 : Map<FileId, FileInfo2>;
  };

  public func empty () : State {

    let st : State = {
      chunks = TrieMap.TrieMap<ChunkId, ChunkData>(Text.equal, Text.hash);
      files = TrieMap.TrieMap<FileId, FileInfo>(Text.equal, Text.hash);
      files2 = TrieMap.TrieMap<FileId, FileInfo2>(Text.equal, Text.hash);
    };
    st
  };

};
