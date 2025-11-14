import Head from "expo-router/head";

export default function PageTitle({ title }: { title?: string }) {
  return (
    <Head>
      <title>{`${title ? `${title} | ` : ""}Dani's Voice App`}</title>
    </Head>
  );
}
