// Copyright 2018-2020 @paritytech/Nomidot authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
  DeriveBalancesAll,
  DeriveStakingAccount,
  DeriveUnlocking,
} from '@polkadot/api-derive/types';
import { formatBalance, formatNumber } from '@polkadot/util';
import React from 'react';
import Loader from 'semantic-ui-react/dist/commonjs/elements/Loader';

import { Icon, WrapperDiv } from './index';
import {
  DynamicSizeText,
  FadedText,
  StackedHorizontal,
  StyledLinkButton,
} from './Shared.styles';
import { FontSize, FontWeight, OrientationType } from './types';

export type BalanceDisplayProps = {
  allBalances?: DeriveBalancesAll;
  allStaking?: DeriveStakingAccount;
  detailed?: boolean;
  fontSize?: FontSize;
  fontWeight?: FontWeight;
  handleRedeem?: (address: string) => void;
  orientation?: 'horizontal' | 'vertical';
};

const defaultProps = {
  detailed: false,
  fontSize: 'large' as FontSize,
  orientation: 'vertical' as OrientationType,
};

// FIXME: https://github.com/paritytech/substrate-light-ui/issues/471
export function BalanceDisplay(
  props: BalanceDisplayProps = defaultProps
): React.ReactElement {
  const {
    allBalances,
    allStaking,
    detailed,
    fontSize,
    fontWeight,
    handleRedeem,
  } = props;

  const renderRedeemButton = (): React.ReactElement | null => {
    return allStaking && allStaking.controllerId ? (
      <StyledLinkButton
        onClick={(): void =>
          allStaking &&
          allStaking.controllerId &&
          handleRedeem &&
          handleRedeem(allStaking.controllerId.toString())
        }
      >
        <Icon name='lock' />
        Redeem Funds
      </StyledLinkButton>
    ) : null;
  };

  const renderUnlocking = (): React.ReactElement | null => {
    return allStaking && allStaking.unlocking ? (
      <>
        {allStaking.unlocking.map(
          ({ remainingEras, value }: DeriveUnlocking, index: number) => (
            <div key={index}>
              <FadedText>Unbonded Amount: {formatBalance(value)}</FadedText>
              <FadedText> Eras remaining: {remainingEras.toNumber()}</FadedText>
            </div>
          )
        )}
      </>
    ) : null;
  };

  const renderDetailedBalances = (): React.ReactElement => {
    if (!allBalances) {
      return <></>;
    }

    const { availableBalance, lockedBalance, reservedBalance } = allBalances;

    return (
      <>
        <hr />
        <WrapperDiv width='90%' margin='0' padding='0'>
          <StackedHorizontal justifyContent='space-between'>
            <b>Available:</b>
            {formatBalance(availableBalance)}
          </StackedHorizontal>
          <StackedHorizontal justifyContent='space-between'>
            {allStaking && allStaking.redeemable && (
              <>
                <b>Redeemable:</b>
                {formatBalance(allStaking.redeemable)}
                {allStaking.redeemable.gtn(0) && renderRedeemButton()}
              </>
            )}
          </StackedHorizontal>
          <StackedHorizontal justifyContent='space-between'>
            <b>Reserved:</b>
            {reservedBalance && (
              <FadedText>{formatBalance(reservedBalance)}</FadedText>
            )}
          </StackedHorizontal>
          <StackedHorizontal justifyContent='space-between'>
            <b>Locked:</b>
            {lockedBalance && formatBalance(lockedBalance)}
          </StackedHorizontal>
          {renderUnlocking()}
        </WrapperDiv>
      </>
    );
  };

  return (
    <>
      {allBalances ? (
        <StackedHorizontal justifyContent='space-around' alignItems='stretch'>
          <DynamicSizeText fontSize={fontSize} fontWeight={fontWeight}>
            <strong>Total Balance:</strong>{' '}
            {allBalances.freeBalance && formatBalance(allBalances.freeBalance)}
          </DynamicSizeText>
          <FadedText>
            Transactions: {formatNumber(allBalances.accountNonce)}{' '}
          </FadedText>
        </StackedHorizontal>
      ) : (
        <Loader active inline />
      )}
      {detailed && allBalances && renderDetailedBalances()}
    </>
  );
}
