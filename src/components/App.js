import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import CreateBet from '../abis/CreateBet.json';
import Navbar from './Navbar';
import Main from './Main';
import About from './About';
import Verified from './Verified';
import Opensource from './Opensource';
import { Routes ,Route } from 'react-router-dom';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = CreateBet.networks[networkId]
    if(networkData) {
      const createBet = web3.eth.Contract(CreateBet.abi, networkData.address)
      this.setState({ createBet })
      const betCount = await createBet.methods.index().call()
      const bettorCount = await createBet.methods.bettorindex().call()
      this.setState({ betCount })
      // Load Bets and stats

      for (var i = 0; i <= betCount - 1; i++) {
        const bet = await createBet.methods.bets(i).call()
        const stat = await createBet.methods.stats(i).call()

        this.setState({
          bets: [...this.state.bets, bet],
          stats: [...this.state.stats, stat],
          
        })

      }

      for (var ii = bettorCount - 1; ii >= 0; ii--) {
        const test = await createBet.methods.tests(ii).call()

        this.setState({
          tests: [...this.state.tests, test],
          
        })

      }
      

      

      // Sort bets. Show highest voted bets first
      this.setState({
        bets: this.state.bets.sort((a,b) => (b._yesvotes + b._novotes) - (a._yesvotes + a._novotes)),
      })
      this.setState({ loading: false})
    } else {
      window.alert('CreateBet contract not deployed to detected network.')
    }
  }

  createyesnobet(proposition, odds, gasfees, adminfees, genesiscost) {
    this.setState({ loading: true })
    this.state.createBet.methods.createyesnobet(proposition, odds, gasfees, adminfees, genesiscost).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  betyes(id, betAmount) {
    this.setState({ loading: true })
    this.state.createBet.methods.betyes(id).send({ from: this.state.account, value: betAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }
  
  betno(id, betAmount) {
    this.setState({ loading: true })
    this.state.createBet.methods.betno(id).send({ from: this.state.account, value: betAmount })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  revertyes(id, player) {
    this.setState({ loading: true })
    this.state.createBet.methods.revertyes(id, player).send({ from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }
  
  revertno(id, player) {
    this.setState({ loading: true })
    this.state.createBet.methods.revertno(id, player).send({ from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  setoracle(id, betoutcome) {
    this.setState({ loading: true })
    this.state.createBet.methods.setoracle(id, betoutcome).send({ from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  resolve(id) {
    this.setState({ loading: true })
    this.state.createBet.methods.resolve(id).send({ from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      createBet: null,
      betCount: 0,
      bets: [],
      stats: [],     
      tests: [],
      loading: true
    }

    this.createyesnobet = this.createyesnobet.bind(this)
    this.betyes = this.betyes.bind(this)
    this.betno = this.betno.bind(this)
    this.revertyes = this.revertyes.bind(this)
    this.revertno = this.revertno.bind(this)
    this.setoracle = this.setoracle.bind(this)
    this.resolve = this.resolve.bind(this)

  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <Routes>
        <Route exact path='/' element=
           { this.state.loading
            ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
            : <Main
                account={this.state.account}
                bets={this.state.bets}
                stats={this.state.stats}
                tests={this.state.tests}
                createyesnobet={this.createyesnobet}
                betyes={this.betyes}
                betno={this.betno}
                revertyes={this.revertyes}
                revertno={this.revertno}
                setoracle={this.setoracle}
                resolve={this.resolve}
              />
          }/>
          <Route exact path='/about' element={<About/>} />
          <Route exact path='/verified' element={<Verified/>} />
          <Route exact path='/opensource' element={<Opensource/>} />
        </Routes>
      </div>
    );
    
  }
}

export default App;

