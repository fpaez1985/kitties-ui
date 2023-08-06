import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import NftCards from './NftsCards'

const parseNft = ({ dna, price, gender, owner }) => ({
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON(),
})

function toHexString(byteArray) {
  var s = '0x'
  byteArray.forEach(function (byte) {
    s += ('0' + (byte & 0xff).toString(16)).slice(-2)
  })
  return s
}

export default function Nfts(props) {
  const { api, keyring } = useSubstrateState()
  const [nfts, setNfts] = useState([])
  const [status, setStatus] = useState('')

  const subscribeCount = () => {
    let unsub = null

    const asyncFetch = async () => {
      unsub = await api.query.substrateNfts.countForNfts(async count => {
        // Fetch all Nft keys
        const entries = await api.query.substrateNfts.nfts.entries()
        const nftsMap = entries.map(entry => {
          return {
            id: toHexString(entry[0].slice(-32)),
            ...parseNft(entry[1].unwrap()),
          }
        })
        setNfts(nftsMap)
      })
    }

    asyncFetch()

    return () => {
      unsub && unsub()
    }
  }

  useEffect(subscribeCount, [api, keyring, nfts])

  return (
    <Grid.Column width={16}>
      <h1>Nfts</h1>
      <NftCards nfts={nfts} setStatus={setStatus} />
      <Form style={{ margin: '1em 0' }}>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            label="Create Nft"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'substrateNfts',
              callable: 'createNft',
              inputParams: [],
              paramFields: [],
            }}
          />
        </Form.Field>
      </Form>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Grid.Column>
  )
}
