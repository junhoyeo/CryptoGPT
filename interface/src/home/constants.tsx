import clsx from 'clsx';
import { shortenAddress } from '@/utils/address';

type TokenLogoProps = React.HTMLAttributes<HTMLImageElement> & {
  src: string;
};
const TokenLogo: React.FC<TokenLogoProps> = ({ src, className, style, ...props }) => (
  <img
    className={clsx('inline-block', className)}
    src={src}
    style={{
      width: 16,
      height: 16,
      marginLeft: 3,
      filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.33))',
      objectFit: 'contain',
      ...style,
    }}
    {...props}
  />
);

export const EXAMPLE_PROMPTS = [
  'Send zero value transaction to yourself.',
  {
    display: (
      <>
        Wrap{' '}
        <span className="inline-block">
          <TokenLogo src="/assets/eth.png" /> 1 ETH
        </span>{' '}
        with{' '}
        <span className="inline-block">
          <TokenLogo src="/assets/weth.png" /> WETH
        </span>{' '}
        deployed to <code>{shortenAddress('0x043c471bEe060e00A56CcD02c0Ca286808a5A436')}</code>. ABI is{' '}
        <code>{`{"inputs":[], "name":"deposit", "outputs":[], ...}`}</code>.
      </>
    ),
    prompt:
      'Wrap 1 ETH to WETH deployed to 0x043c471bEe060e00A56CcD02c0Ca286808a5A436. ABI is {"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}.',
  },
  {
    display: (
      <>
        Swap{' '}
        <span className="inline-block">
          <TokenLogo src="/assets/eth.png" /> 0.1 ETH
        </span>{' '}
        to{' '}
        <span className="inline-block">
          <TokenLogo src="/assets/matic.png" className="rounded-full" /> MATIC
        </span>{' '}
        with{' '}
        <span className="inline-block">
          <TokenLogo src="/assets/uni.png" className="bg-white rounded-full" /> UniswapRouterV2
        </span>{' '}
        deployed in <code>{shortenAddress('0xAbc12345Def67890FEdcBa09876E543210FeDcBa')}</code>.
        {/* FIXME: Change fake address lol */}
      </>
    ),
    prompt:
      'Swap 0.1 ETH to MATIC with UniswapRouterV2 deployed in 0xAbc12345Def67890FEdcBa09876E543210FeDcBa.',
  },
];
