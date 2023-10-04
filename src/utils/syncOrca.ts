import axios from 'axios';

class SyncOrca {
  public async execute(): Promise<void> {
    try {
      const listInsert = [];
      const listUpdate = [];

      async function getOrcaDest() {
        const response = await axios.get (
          `http://127.0.0.1:3001/orcamentos/select`
        );
        return response.data;
      }

      async function getOrcaSrc() {
        const response = await axios.get (
          `url_api_bussines`  // Substitua pela URL correta da API de orçamentos
        );
        return response.data;
      }

      const selectSrc = await getOrcaSrc();
      const selectDest = await getOrcaDest();

      async function getCodusua() {
        const response = await axios.get (
          `http://127.0.0.1:3001/vendedores/codigo`
        );
        return response.data;
      }

      const listCodusua = await getCodusua();

      for (const itemSrc of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemSrc);
        } else {
          const itemDest = selectDest.find(
            (itemDois) =>
              itemDois.codorca == itemSrc.codorca &&
              itemDois.id_fili == itemSrc.id_fili
          );

          if (!itemDest) {
            listInsert.push(itemSrc);
          } else if (
            this.changeTime(itemSrc.updated_at) !=
            this.changeTime(itemDest.updated_at)
          ) {
            listUpdate.push(itemSrc);
          }
        }
      }

      const listOrcaSrc = (listInsert).filter((row) =>
        listCodusua.some((cod) => cod.codusua === row.codusua)
      );

      console.log("Iniciando o sync dos orçamentos");

      if (listInsert.length > 0) {
        for (const row of listOrcaSrc) {
          const dataInsert = {
            codorca: row.codorca,
            codfili: row.codfili,
            resseri: row.resseri,
            id_fili: row.id_fili,
            datpedi: row.datpedi,
            codclie: row.codclie,
            codusua: row.codusua,
            vlrorca: row.vlrorca,
            vlrliqu: row.vlrliqu,
            nomparc: row.nomparc,
            staorca: row.staorca,
            cidade: row.cidade,
            produtos: {},
            updated_at: row.updated_at,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/orcamentos/enviar`,
            headers: {
              "Content-Type": "application/json",
            },
            data: dataInsert,
          };

          try {
            await axios(config);
          } catch (e) {
            console.error(
              `Erro ao inserir registro: ${JSON.stringify(dataInsert)}`
            );
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      if (listUpdate.length > 0) {
        for (const row of listUpdate) {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codorca == row.codorca && itemDois.id_fili == row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/orcamentos/${itemAchado?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              codorca: row.codorca,
              codfili: row.codfili,
              resseri: row.resseri,
              id_fili: row.id_fili,
              datpedi: row.datpedi,
              codclie: row.codclie,
              codusua: row.codusua,
              vlrorca: row.vlrorca,
              vlrliqu: row.vlrliqu,
              nomparc: row.nomparc,
              staorca: row.staorca,
              cidade: row.cidade,
              produtos: {},
              updated_at: row.updated_at,
            },
          };

          try {
            await axios(config);
            console.log(`Registro atualizado com sucesso: ${row.codorca}`);
          } catch (e) {
            console.error(`Erro ao atualizar registro: ${row.codorca}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      console.log("Sincronização dos orçamentos finalizada");
    } catch (err) {
      console.error(err);
    }
  }

  public changeTime(date: string) {
    if (date != null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }
}

export default new SyncOrca();
