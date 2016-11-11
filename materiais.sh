#!/bin/bash
materiais() 
{
  local OPTIND
  case "$1" in
    #running from bash completion
    materiais)
      local opts=""
      local cur="${COMP_WORDS[COMP_CWORD]}"
      local prev="${COMP_WORDS[COMP_CWORD-1]}"
      local antprev="${COMP_WORDS[COMP_CWORD-2]}"
      local line="${COMP_LINE}"
      if [ "$cur" == '=' ]
      then
        cur=""
        antprev="$prev"
      fi
      case "$antprev" in
        --operacao)
          opts="$(${line%--operacao*} --operacoes | xargs echo)"
        ;;
        *)
          opts="--server= --operacao= --equipe= --apreensao="
          opts+=" --operacoes --esquipes --apreensoes --paths"
        ;;
      esac
    
      COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
      return 0
    ;;  
    #running from shell
    *)
      local CONDITIONS
      while getopts ':-:' OPT
      do
        case ${OPT} in
          -)
            case ${OPTARG} in 
              server=*)
                local SERVER=${OPTARG#*=}
              ;;
              operacao=*)
                local val=${OPTARG#*=}
                CONDITIONS+=${CONDITIONS:+,}'"operacao":"'${val}'"'
              ;;
              equipe=*)
                local val=${OPTARG#*=}
                CONDITIONS+=${CONDITIONS:+,}'"equipe":"'${val}'"'
              ;;
              apreensao=*)
                local val=${OPTARG#*=}
                CONDITIONS+=${CONDITIONS:+,}'"apreensao":"'${val}'"'
              ;;
            esac
          ;;
        esac
      done
      : ${SERVER?-Please set --server=IP:PORT}
      CONDITIONS=${CONDITIONS:+conditions=\{$CONDITIONS\}\&}
      local DISTINCT=_id
      OPTIND=0
      while getopts ':-:' OPT
      do
        case ${OPT} in
          -)
            case ${OPTARG} in 
              operacoes)
                DISTINCT=operacao
              ;;
              apreensoes)
                DISTINCT=apreensao
              ;;
              equipes)
                DISTINCT=equipe
              ;;
              paths)
                DISTINCT=path
              ;;
            esac
          ;;
        esac
      done
      DISTINCT="distinct=${DISTINCT}"
      local URL="http://${SERVER}/api/material?${CONDITIONS}${DISTINCT}"
      wget -q -O - "$URL" | sed -e '1s/^\[//' -e 's/,$//' -e '$s/\]$//' | xargs -L 1 echo
    ;;
  esac
}
complete -o nospace -F materiais materiais
if [ ${0##*/} == "materiais.sh" ]
then
  materiais "$@"
fi
