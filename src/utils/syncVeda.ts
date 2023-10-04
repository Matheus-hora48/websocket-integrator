import axios from 'axios';

class SyncVeda {
  public async execute(): Promise<void> {
    try {
      const listInsert = [];
      const listUpdate= [];

      async function getVendaDest() {
        const response = await axios.get (
          `http://127.0.0.1:3001/vendas/select`
        );
        return response.data;
      }

      async function getVendaSrc(){
        const response = await axios.get(
          `url_api_venda`  // Substitua pela URL correta da API de vendas
        );
        return response.data;
      }

      const selectSrc = await getVendaSrc();
      const selectDest = await getVendaDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.numnota == itemUm.numnota &&
              itemDois.id_fili == itemUm.id_fili
          );

          if (!itemAchado) {
            listInsert.push(itemUm);
          } else if (
            this.changeTime(itemUm.updated_at) !=
            this.changeTime(itemAchado.updated_at)
          ) {
            listUpdate.push(itemUm);
          }
        }
      }

      console.log("Iniciando o sync das vendas");

      if (listInsert.length > 0) {
        for (const row of listInsert) {
          const dataInsert = {
            numnota: row.numnota,
            servend: row.servend,
            codfili: row.codfili,
            id_fili: row.id_fili,
            datvend: row.datvend,
            codparc: row.codparc,
            venvend: row.venvend,
            vlrliqu: row.vlrliqu,
            vlrnota: row.vlrnota,
            nomparc: row.nomparc,
            staorca: row.staorca,
            cidade: row.cidade,
            produtos: {},
            updated_at: row.updated_at,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/vendas/enviar`,
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
              itemDois.numnota == row.numnota && itemDois.id_fili == row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/vendas/${itemAchado?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              numnota: row.numnota,
              servend: row.servend,
              codfili: row.codfili,
              id_fili: row.id_fili,
              datvend: row.datvend,
              codparc: row.codparc,
              venvend: row.venvend,
              vlrliqu: row.vlrliqu,
              vlrnota: row.vlrnota,
              nomparc: row.nomparc,
              staorca: row.staorca,
              cidade: row.cidade,
              produtos: {},
              updated_at: row.updated_at,
            },
          };

          try {
            await axios(config);
            console.log(`Registro atualizado com sucesso: ${row.numnota}`);
          } catch (e) {
            console.error(`Erro ao atualizar registro: ${row.numnota}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      console.log("Sincronização das vendas finalizada");

    } catch (err) {
      console.error(err);
    }
  }

  /**
   * changeTime
   */
  public changeTime(date: string) {
    if (date != null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }

  public changeStaorca(staorca: string) {
    if (staorca == undefined) {
      return null;
    }
    return staorca;
  }
}

export default new SyncVeda();
