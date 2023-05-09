import { APP_NAME } from "@config/constants";

export default function Head() {
  return (
    <>
      <title>{APP_NAME}</title>
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
