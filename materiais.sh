#!/bin/bash
materiais() 
{
  local OPTIND
  case "$1" in
    #running from bash completion
    materiais)
      local opts=""
      local cur="${COMP_WORDS[COMP_CWORD]}"
      local line="${COMP_LINE}"
      local last="${line##* }"
      case "$last" in
        --*=*)
          local field="${last%=*}"
          field="${field#*--}"
          opts="$(${line%$last} --list-${field})"
          COMPREPLY=( $(compgen -W "${opts}" -- ${last#*=} | xargs -I x echo --$field=x) )
          return 0
        ;;
        *)
          opts="--server= --operacao= --equipe= --apreensao="
          opts+=" --list-operacao --list-equipe --list-apreensao --list-path"
          COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
          return 0
        ;;
      esac
    ;;  
    #running from shell
    *)
      local CONDITIONS
      local DISTINCT=_id
      while getopts ':-:' OPT
      do
        case ${OPT} in
          -)
            case ${OPTARG} in 
              server=*)
                local SERVER=${OPTARG#*=}
              ;;
              *=*)
                local field=${OPTARG%=*}
                local val=${OPTARG#*=}
                CONDITIONS+=${CONDITIONS:+,}"\"${field}\":\"${val}\""
              ;;
              list-*)
                local field=${OPTARG#list-}
                DISTINCT=$field
              ;;
            esac
          ;;
        esac
      done
      : ${SERVER?-Please set --server=IP:PORT}
      CONDITIONS=${CONDITIONS:+conditions=\{$CONDITIONS\}\&}
      DISTINCT="distinct=${DISTINCT}"
      local URL="http://${SERVER}/api/material?${CONDITIONS}${DISTINCT}"
      wget -q -O - "$URL" | sed -e '1s/^\[//' -e 's/,$//' -e '$s/\]$//' | xargs -L1 echo
    ;;
  esac
}
complete -o nospace -F materiais materiais
if [ ${0##*/} == "materiais.sh" ]
then
  materiais "$@"
fi
