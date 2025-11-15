import { updatedStoredTextValue } from "@/store/storedTexts";
import { StoredText } from "@/types/StoredText";
import { useEffect, useState } from "react";
import { Button, Dialog, TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";

type Props = {
  storedText: StoredText | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  setText: (text: string) => void;
  onCancel?: () => void;
};

export default function EditStoredTextDialog({
  storedText,
  isEditing,
  setIsEditing,
  setText,
  onCancel,
}: Props) {
  const [newText, setNewText] = useState(
    storedText ? storedText.text || "" : "",
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setNewText(storedText ? storedText.text || "" : "");
  }, [storedText]);

  return (
    <Dialog
      visible={isEditing}
      onDismiss={() => {
        setIsEditing(false);
      }}>
      <Dialog.Content>
        <TextInput mode="outlined" value={newText} onChangeText={setNewText} />
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          mode="contained"
          style={{ paddingHorizontal: 15 }}
          onPress={() => {
            setIsEditing(false);
            setText(newText);
            if (storedText) {
              dispatch(
                updatedStoredTextValue({
                  id: storedText?.id,
                  value: newText,
                }),
              );
            }
            if (onCancel) {
              onCancel();
            }
          }}>
          Save
        </Button>
        <Button
          onPress={() => {
            setIsEditing(false);
            if (onCancel) {
              onCancel();
            }
            setNewText(storedText ? storedText.text || "" : "");
          }}>
          Cancel
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
