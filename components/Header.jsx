import { ConnectButton } from "web3uikit";

export default function Header(){
    return(
        <div id="header">
        <span class="title">&emsp;NFTfy</span>
        <div class="connect">
            <ConnectButton moralisAuth={false}/>
        </div>
        </div>
    )
}