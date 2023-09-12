import Cross from "@components/Icons/Cross";
import { T } from "@mantle/ui";

type Props = {
  title: string;
  isCloseable: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function DialogBase({
  title,
  isCloseable,
  onClose,
  children,
}: Props) {
  return (
    <div className="max-w-[484px] w-full grid relative bg-white/5 overflow-y-auto overflow-x-clip md:overflow-hidden border border-[#1C1E20] rounded-2xl mx-auto">
      <div className="w-full md:max-w-lg transform text-left align-middle transition-all space-y-10 px-4 py-6">
        <div className="flex flex-row justify-between items-center">
          <T variant="modalHeadingSm" className="w-full">
            {title}
          </T>
          {isCloseable && (
            <button type="button" className="cursor-pointer" onClick={onClose}>
              <Cross />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
