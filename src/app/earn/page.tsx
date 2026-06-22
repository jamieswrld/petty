import dynamic from 'next/dynamic'

const Earn = dynamic(() => import('../pages/earn'))
export default function Page() {
  return <Earn/>
}
