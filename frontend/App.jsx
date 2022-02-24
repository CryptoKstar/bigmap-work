import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {Box, Button, CircularProgress, Grid, Input, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from  '@mui/material'

import Resizer from 'react-image-file-resizer';
import { httpAgent, canisterHttpAgent,httpAgentIdentity } from './src/httpAgent';

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

const App  =  () => {

  const [File , setFile] =useState([])
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allFiles, setAllFiles] = useState([])
  const MAX_CHUNK_SIZE = 1024 * 1024 * 1.5 ; // 1.5MB

  const encodeArrayBuffer = (file) => Array.from(new Uint8Array(file));
  
  const resizeFile = (file) => new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      70,
      58,
      'JPEG',
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      'base64',
      70,
      58,
    );
  });
  
  const isImage = (mimeType) => {
    let flag = false;
    if (mimeType.indexOf('image') !== -1) {
      flag = true;
    }
    return (flag);
  };
  
  const getFileInit = async (file) => {
    const chunkCount = Number(Math.ceil(file.size / MAX_CHUNK_SIZE));
    if (isImage(file.type)) {
      return {
        chunkCount,
        fileSize: file.size,
        name: file.name,
        mimeType: file.type,
        marked: false,
        sharedWith: [],
        thumbnail: await resizeFile(file),
        folder: ''
      };
    }
    return {
      chunkCount,
      fileSize: file.size,
      name: file.name,
      mimeType: file.type,
      marked: false,
      sharedWith: [],
      thumbnail: '',
      folder: ''
    };
  }
  
  const uploadFile = async (file, userAgent)  => {
    const fileInit = await getFileInit(file);
    console.log(fileInit)
    const [fileId] = await userAgent.createFile(fileInit, localStorage.getItem('UserName'));
    console.log(fileId)
    let chunk = 1;
    for ( let byteStart = 0; byteStart < file.size; byteStart += MAX_CHUNK_SIZE, chunk += 1 ) {
      const fileSlice = file.slice(byteStart, Math.min(file.size, byteStart + MAX_CHUNK_SIZE), file.type);
      const fileSliceBuffer = (await fileSlice.arrayBuffer()) || new ArrayBuffer(0);
      const sliceToNat = encodeArrayBuffer(fileSliceBuffer);
      await userAgent.putFileChunk(fileId, chunk, sliceToNat);
      const uploadProgress = 100 * (chunk / fileInit.chunkCount).toFixed(2)
      setProgress(uploadProgress)
      if (chunk >= fileInit.chunkCount) {
        setLoading(false)
      }
    }
    const data = await userAgent.getFiles()
    setAllFiles(data[0])
  }

  const handUpload = async () => {
    setProgress(0)
    setLoading(true)
    if(!localStorage.getItem('fileCanister')){
      const icdrive = await httpAgent();
      const canId = await icdrive.createCanister(localStorage.getItem('UserName'))
      localStorage.setItem('fileCanister', canId[0].toText());
    }
    const userAgent = await canisterHttpAgent();
    try {
      await uploadFile(File[0], userAgent);
      // console.timeEnd('Stored in');
    } catch (error) {
      // console.error('Failed to store file.', error);
      return (0);
    }
  }

  useEffect( async () => {
    const icdrive = await httpAgent();
    const userName = await icdrive.getUserId()
    const canister = await icdrive.getProfile()
    const canId = canister[0].fileCanister.toText()
    localStorage.setItem('fileCanister', canId);
    localStorage.setItem('UserName', userName[0].toText());
    if(localStorage.getItem('fileCanister')){
      const userAgent = await canisterHttpAgent();
      const data = await userAgent.getFiles()
      setAllFiles(data[0])
    }
  },[])
  return(
    <Box>
      <Grid container p={10}>
        <Grid item md={6} alignItems="center" justifyContent="center">
          <Typography variant='h3'>Upload Video</Typography>
          <Stack direction="row" pt={10} spacing={5}>
            <Stack direction="row" spacing={3}>
              <Input accept="*" id="contained-button-file" multiple type="file" onChange={(e) => setFile(e.target.files)} />
              <LoadingButton variant="contained" loading={loading}  loadingIndicator="Uploading..." onClick={() => handUpload()}>
                Upload File
              </LoadingButton>
            </Stack>
            <CircularProgressWithLabel value={progress} />
          </Stack>
        </Grid>

        <Grid item md={6}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell align="center">FileName</TableCell>
                  <TableCell align="center">Size</TableCell>
                  <TableCell align="center">CanisterId</TableCell>
                  <TableCell align="center">UserName</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allFiles.map((item, key) => (
                  <TableRow
                    key={key}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {key + 1}
                    </TableCell>
                    <TableCell align="center">{item.name}</TableCell>
                    <TableCell align="center">{Math.floor(Number(item.fileSize)/1024)} KB</TableCell>
                    <TableCell align="center">{localStorage.getItem('fileCanister')}</TableCell>
                    <TableCell align="center">{item.userName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

      </Grid>
        
    </Box>
  )
}
export default App