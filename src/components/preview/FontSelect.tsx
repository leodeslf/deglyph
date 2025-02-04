import { ChangeEvent } from "react";
import { useAppSelector } from "../../stores/hooks";

type FontPickerProps = {
  fontIndex: number,
  setFontIndex: (index: number) => void,
  setStyleIndex: (index: number) => void
};

export default function FontPicker({
  fontIndex,
  setFontIndex,
  setStyleIndex
}: FontPickerProps) {
  const { optimizedFonts } = useAppSelector(state => state);

  function fontPickerChangeHandler(
    { target }: ChangeEvent<HTMLSelectElement>
  ): void {
    setStyleIndex(0);
    setFontIndex(target.selectedIndex);
  }

  return (
    <span>
      <label htmlFor="font-picker">
        Family
      </label>
      <select
        id="font-picker"
        onChange={fontPickerChangeHandler}
        value={fontIndex}
      >
        {optimizedFonts.map(({ errorMessage, id, family }) => (
          <option
            key={id}
            value={id}
            disabled={errorMessage !== undefined}
          >
            {family}
          </option>
        ))}
      </select>
    </span>
  );
}
