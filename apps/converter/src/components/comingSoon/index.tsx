import { Typography } from "@mantle/ui";
import { getLocalDateTime } from "@utils/formatDate";

export default function ComingSoon() {
  const releaseDate = new Date(Date.UTC(2023, 6, 17, 15, 0, 0));

  return (
    <>
      <div className="md:grow md:mt-0 mt-36 flex justify-center items-center">
        <Typography className="text-center md:text-[80px] text-[42px] font-medium text-white">
          Migrate $BIT
        </Typography>
      </div>

      <Typography className="md:mt-40 mt-8 mb-14 text-center md:text-[42px] text-[28px] font-medium text-white">
        Release date:
      </Typography>
      <Typography className="md:mb-14 mb-4 text-center md:text-[32px] text-[28px] font-medium">
        {getLocalDateTime(releaseDate)}
      </Typography>
    </>
  );
}
