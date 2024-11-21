import React, { useState } from 'react';
import { Modal } from '@fluentui/react/lib/Modal';
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack } from '@fluentui/react/lib/Stack';
import { PrimaryButton, DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { IIconProps } from '@fluentui/react/lib/Icon';
import { EmployeeInfo } from '../../../types.ts';
import { assign, GroupResult} from '../../../algo/assign.ts';
import { useNavigate } from 'react-router-dom';
import { ProgressIndicator, Text } from "@fluentui/react";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: EmployeeInfo[];
  setGroupResult: React.Dispatch<React.SetStateAction<GroupResult>>;
}

const GroupModal: React.FC<GroupModalProps> = (
  {
    isOpen,
    onClose,
    employeeData,
    setGroupResult,
  }
) => {
  const [groupCount, setGroupCount] = useState<number>(10);
  const [roundCount, setRoundCount] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [optProgress, setOptProgress] = useState<number>(0);
  const [optScore, setOptScore] = useState<number>(0);
  const navigate = useNavigate();

  const handleGroupAction = async () => {
    setLoading(true); // ローディングを開始して表示する
    await new Promise((resolve) => setTimeout(resolve, 1));

    try {
      const result = await assign(employeeData, groupCount, roundCount, setOptProgress, setOptScore);
      setGroupResult(result); // グループ結果を保存
      onClose(); // モーダルを閉じる
      navigate('/result'); // 結果ページに遷移
    } catch (error) {
      console.error("エラーが発生しました:", error);
      alert("エラーが発生しました。再試行してください。");
    } finally {
      setLoading(false); // 処理が完了したらローディングを終了
    }
  };

  const closeIcon: IIconProps = { iconName: 'Cancel' };

  return (
    <Modal isOpen={isOpen} onDismiss={onClose} isBlocking={false} containerClassName="modal-container">
      <div style={{ padding: '20px', width: '400px' }}>
        {loading ? (
          <Stack tokens={{ childrenGap: 10 }}>
            <Text variant="large">グループ分け中...</Text>
            <ProgressIndicator label="進捗" percentComplete={optProgress} />
            <Text variant="medium">最適化スコア: {optScore.toFixed(1)}</Text>
          </Stack>
          ) : (
            <>
              <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <span style={{fontSize: 'large' }}>グループ分けの設定</span>
                <IconButton iconProps={closeIcon} ariaLabel="Close popup" onClick={onClose} />
              </Stack>
              <Stack tokens={{ childrenGap: 15 }} styles={{ root: { marginTop: '20px' } }}>
                <TextField
                  label="グループ数"
                  type="number"
                  value={groupCount.toString()}
                  onChange={(_, value) => setGroupCount(Number(value))}
                />
                <TextField
                  label="ラウンド数"
                  type="number"
                  value={roundCount.toString()}
                  onChange={(_, value) => setRoundCount(Number(value))}
                />
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { marginTop: '20px' } }}>
                <DefaultButton text="キャンセル" onClick={onClose} />
                <PrimaryButton text="実行" onClick={handleGroupAction} />
              </Stack>
            </>
          )
        }

      </div>
    </Modal>
  );
};

export default GroupModal;
