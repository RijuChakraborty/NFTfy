import { useWeb3Contract } from "react-moralis"
import contractAbi from "../constants/abi.json"
import contractAddress from "../constants/contractAddress.json"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
// import {ethers} from "ethers"
import { useNotification } from "web3uikit"
import axios from "axios"
// import pinataSDK from "@pinata/sdk"

export default function Minter(){
    const {chainId: chainIdHex, isWeb3Enabled, account}= useMoralis()
    const chainId= parseInt(chainIdHex)
    const NftfyAddress= chainId in contractAddress ? contractAddress[chainId][0]: null
    const [fileImg, setFileImg] = useState(null);
    const [name,setName]= useState("")
    const [desc,setDesc]= useState("")
    const [tokenURI,setTokenURI]= useState("")
    console.log(NftfyAddress)
    console.log(account)

    const dispatch= useNotification()
    const metadataTemplate = {
        name: "",
        description: "",
        image: "",
    }

    const {runContractFunction: mintNft}= useWeb3Contract({
        abi: contractAbi,
        contractAddress: NftfyAddress,
        functionName: "mintNft",
        params: {
            tokenURI: tokenURI
        }
    })

    const handleSuccess= async function(tx){
        await tx.wait(1)
        handleNewNotification(tx)
    }

    const handleNewNotification= function(){
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell"
        })
    }

    const handleSubmission = async (e) => {
        e.preventDefault()
        if (fileImg) {
            try {

                const formData = new FormData();
                formData.append("file", fileImg);

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        'pinata_api_key': `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
                        'pinata_secret_api_key': `${process.env.NEXT_PUBLIC_PINATA_API_SECRET}`,
                        "Content-Type": "multipart/form-data"
                    },
                });

                const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
                console.log(ImgHash); 

                let tokenUriMetadata = { ...metadataTemplate }
                tokenUriMetadata.name= name
                tokenUriMetadata.description= desc
                tokenUriMetadata.image= ImgHash

                const resHash= await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                    data: tokenUriMetadata,
                    headers: {
                        'pinata_api_key': `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
                        'pinata_secret_api_key': `${process.env.NEXT_PUBLIC_PINATA_API_SECRET}`,
                        "Content-Type": "application/json"
                    },
                });

                const UriHash=`ipfs://${resHash.data.IpfsHash}`;
                setTokenURI(UriHash);
                console.log(tokenURI);

            } catch (error) {
                console.log("Error sending File to IPFS: ")
                console.log(error)
            }
        }
    }
    
        
    
    return(
        <div class="Box">
            <div>
                <form onSubmit={handleSubmission}>
                    <input type="file" onChange={(e) =>setFileImg(e.target.files[0])} required />
                    <input
                        type="text"
                        id="NFTname"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        placeholder="Name of NFT"
                    ></input>
                    <input
                        type="text"
                        id="NFTdesc"
                        value={desc}
                        onChange={(e)=>setDesc(e.target.value)}
                        placeholder="Description"
                    ></input>
                    <button
                        class="buttons"
                        id="uploadBut"
                        type='submit'
                        // onClick={
                        //     async function(){
                        //         await notify({
                        //             onSuccess: handleNotifForUpload,
                        //         })
                        //     }
                        // } 
                    >Upload</button>            
                    <div id="uriHash">
                                Token URI : {tokenURI}
                    </div>
                </form>


                <button
                    id="mintButton"
                    class="buttons"
                    onClick={
                        async function(){
                            await mintNft({
                                onSuccess: handleSuccess,
                                onError: (error)=>console.log(error),
                            })
                        }
                    }
                >Mint</button>    
            </div>
        </div>
    )
}